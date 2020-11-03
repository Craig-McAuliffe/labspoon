import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {admin} from './config';
import * as adminNS from 'firebase-admin';
import {
  interpretQuery,
  executeExpression,
  makPublicationToPublication,
  Publication,
  MAKPublication,
  MAKAuthor,
  User,
  makAuthorToAuthor,
} from './microsoft';
import {Post} from './posts';
import {
  Topic,
  createFieldAndTopic,
  TaggedTopic,
  convertTopicToTaggedTopic,
} from './topics';

const pubSubClient = new PubSub();
const db = admin.firestore();

export const allPublicationFields =
  'AA.AfId,AA.AfN,AA.AuId,AA.AuN,AA.DAuN,AA.DAfN,AA.S,AW,BT,BV,C.CId,C.CN,CC,CitCon,D,DN,DOI,E,ECC,F.DFN,F.FId,F.FN,FamId,FP,I,IA,Id,J.JId,J.JN,LP,PB,Pt,RId,S,Ti,V,VFN,VSN,W,Y';

export const microsoftAcademicKnowledgePublicationSearch = functions.https.onCall(
  async (data) => {
    let results: Publication[] = [];
    await interpretQuery({
      query: data.query,
      complete: 1,
      count: 1,
    })
      .then((resp) => {
        return executeExpression({
          // `Ty='0'` retrieves only publication type results
          // https://docs.microsoft.com/en-us/academic-services/project-academic-knowledge/reference-entity-attributes
          expr: `And(${resp.data.interpretations[0].rules[0].output.value}, Ty='0')`,
          count: 10,
          attributes: allPublicationFields,
        });
      })
      .then(async (resp) => {
        const publications = resp.data.entities;
        await publishAddPublicationRequests(publications);
        results = publications.map(makPublicationToPublication);
      })
      .catch((err) => {
        console.error(err);
        throw new functions.https.HttpsError('internal', 'An error occured.');
      });
    return results;
  }
);

export function publishAddPublicationRequests(
  makPublications: MAKPublication[]
): Promise<any> {
  const publishPromises = makPublications.map(async (result: object) => {
    const jsonString = JSON.stringify(result);
    const messageBuffer = Buffer.from(jsonString);
    return pubSubClient
      .topic('add-publication')
      .publish(messageBuffer)
      .catch((err: Error) =>
        console.error(
          'Error raised publishing message to add-publication topic with payload',
          jsonString,
          err
        )
      );
  });
  return Promise.all(publishPromises);
}

export const addNewMSPublicationAsync = functions.pubsub
  .topic('add-publication')
  .onPublish(async (message) => {
    if (!message.json) return true;
    const microsoftPublication = message.json as MAKPublication;
    if (!microsoftPublication.Id) return true;
    const microsoftPublicationID = microsoftPublication.Id.toString();
    const microsoftPublicationRef = db
      .collection('MSPublications')
      .doc(microsoftPublicationID);

    try {
      await db.runTransaction(async (t) => {
        const microsoftPublicationDS = await t.get(microsoftPublicationRef);

        // If the Microsoft publication has been added and marked as processed then the labspoon publication must already exist
        if (microsoftPublicationDS.exists) {
          const microsoftPublicationDSData = microsoftPublicationDS.data() as MAKPublication;
          if (microsoftPublicationDSData.processed) return true;
        }

        microsoftPublication.processed = true;

        // store the MS publication and the converted labspoon publication
        t.set(microsoftPublicationRef, microsoftPublication);
        const publication = makPublicationToPublication(microsoftPublication);
        delete publication.authors;
        t.set(db.collection('publications').doc(), publication);

        microsoftPublication.AA?.forEach((author) => {
          const authorID = author.AuId.toString();
          t.set(db.collection('MSUsers').doc(authorID), author);
          t.set(
            db
              .collection('MSUsers')
              .doc(author.AuId.toString())
              .collection('publications')
              .doc(microsoftPublicationID),
            microsoftPublication
          );
        });
        return;
      });
    } catch (err) {
      console.error(err);
    }
    return;
  });

export const createTopicsFromNewPublicationAndAddPublicationToTopic = functions.firestore
  .document('publications/{publicationID}')
  .onCreate(async (change, context) => {
    const publication = change.data();
    const publicationID = context.params.publicationID;
    let publicationTopicPromiseArray;
    if (!publication.topics) publicationTopicPromiseArray = [];
    else
      publicationTopicPromiseArray = publication.topics?.map(
        async (taggedTopic: TaggedTopic) => {
          return createFieldAndTopic(taggedTopic).then((test) => {
            addPublicationToTopic(
              publicationID,
              publication,
              taggedTopic.microsoftID
            );
          });
        }
      );
    return Promise.all(publicationTopicPromiseArray);
  });

export async function addPublicationToTopic(
  publicationID: string,
  publication: Publication,
  topicMicrosoftID?: string
) {
  await db
    .doc(`MSFields/${topicMicrosoftID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) {
        console.error(
          `labspoon topic with id ${topicMicrosoftID} not found; returning`
        );
        return undefined;
      }
      const labspoonTopicID = ds.data()!.processed;
      // the topic returned from the db is not the same format
      // as a tagged topic (tagged topics have an id field and no rank)
      const topicData = ds.data()! as Topic;
      const taggedLabspoonTopic = convertTopicToTaggedTopic(
        topicData,
        labspoonTopicID
      );
      return db
        .runTransaction(async (t) => {
          t.set(
            db.doc(`topics/${labspoonTopicID}/publications/${publicationID}`),
            publication
          );
          t.update(db.doc(`publications/${publicationID}`), {
            topics: adminNS.firestore.FieldValue.arrayUnion(
              taggedLabspoonTopic
            ),
          });
        })
        .catch((err) => {
          console.error(
            `could not add publication with id ${publicationID} to topic with id ${labspoonTopicID} and nor update the publication with the same topic, ${err}`
          );
        });
    });
  return true;
}

export const addNewMAKPublicationToAuthors = functions.firestore
  .document('MSUsers/{msUserID}/publications/{msPublicationID}')
  .onCreate(async (change, context) => {
    const msUserID = context.params.msUserID;
    const msPublicationID = context.params.msPublicationID;

    // Find the publication
    const publicationDS = await getPublicationByMicrosoftPublicationID(
      msPublicationID
    );
    const publicationID = publicationDS.id;
    // Check whether there is a labspoon user corresponding to the microsoft academic ID, otherwise do nothing.
    const userQS = await db
      .collection('users')
      .where('microsoftAcademicAuthorID', '==', msUserID)
      .limit(1)
      .get();
    // If no labspoon user associated we just want to add the name to the authors
    if (userQS.empty) {
      try {
        await db.runTransaction(async (t) => {
          const microsoftUserDS = await t.get(db.doc(`MSUsers/${msUserID}`));
          const microsoftUser = makAuthorToAuthor(
            microsoftUserDS.data() as MAKAuthor
          );
          microsoftUser.microsoftID = msUserID;
          t.update(db.doc(`publications/${publicationID}`), {
            authors: adminNS.firestore.FieldValue.arrayUnion(microsoftUser),
          });
        });
      } catch (err) {
        console.error(err);
      }
      return null;
    }
    const userDS = userQS.docs[0];
    const userID = userDS.id;

    try {
      await db.runTransaction(async (t) => {
        const publicationTDS = await t.get(
          db.doc(`publications/${publicationID}`)
        );
        const userTDS = await t.get(db.doc(`users/${userID}`));
        t.set(
          db.doc(`users/${userID}/publications/${publicationID}`),
          publicationTDS.data()
        );
        const user = userTDS.data() as User;
        const publicationData = publicationTDS.data() as Publication;
        if (publicationData.authors) {
          const existingAuthorEntry = publicationData.authors.find(
            (author) => author.microsoftID === user.microsoftID
          );
          // if we already added the id to the user, we don't want to remove the user here
          delete existingAuthorEntry!.id;
          t.update(db.doc(`publications/${publicationID}`), {
            authors: adminNS.firestore.FieldValue.arrayRemove(
              existingAuthorEntry
            ),
          });
        }
        user.id = userID;
        t.update(db.doc(`publications/${publicationID}`), {
          authors: adminNS.firestore.FieldValue.arrayUnion(user),
        });
      });
    } catch (err) {
      console.error(err);
    }
    return null;
  });

export const addPublicationPostToPublication = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change) => {
    const postID = change.id;
    const post = change.data() as Post;
    const publication = post.content.publication;
    if (!publication) return null;

    // The publication on the post will not yet be associated with an ID as this is not provided
    // at post creation so we need to find the publication ID based on the microsoft ID.
    const publicationDS = await getPublicationByMicrosoftPublicationID(
      publication.microsoftID!
    );
    const publicationID = publicationDS.id;

    const batch = db.batch();
    batch.update(change.ref, {'content.publication.id': publicationID});
    batch.set(publicationDS.ref.collection('posts').doc(postID), post);
    await batch.commit();
    return null;
  });

async function getPublicationByMicrosoftPublicationID(msPublicationID: string) {
  const publicationsQS = await db
    .collection('publications')
    .where('microsoftID', '==', msPublicationID)
    .limit(1)
    .get();
  if (publicationsQS.empty) {
    throw new Error(
      'Could not find publication with microsoft publication ID: ' +
        msPublicationID
    );
  }
  return publicationsQS.docs[0];
}
