import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {admin} from './config';
import {
  interpretQuery,
  executeExpression,
  makPublicationToPublication,
  Publication,
  MAKPublication,
  makFieldToTopic,
  MAKField,
} from './microsoft';
import {Post} from './posts';

const pubSubClient = new PubSub();
const db = admin.firestore();

export const allPublicationFields =
  'AA.AfId,AA.AfN,AA.AuId,AA.AuN,AA.DAuN,AA.DAfN,AA.S,AW,BT,BV,C.CId,C.CN,CC,CitCon,D,DN,DOI,E,ECC,F.DFN,F.FId,F.FN,FamId,FP,I,IA,Id,J.JId,J.JN,LP,PB,Pt,RId,S,Ti,V,VFN,VSN,W,Y';

export const microsoftAcademicKnowledgePublicationSearch = functions.https.onCall(
  async (data, context) => {
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
    if (!message.json) return;
    const microsoftPublication = message.json as MAKPublication;
    if (!microsoftPublication.Id) return;
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
          if (microsoftPublicationDSData.processed) return;
        }

        microsoftPublication.processed = true;

        // store the MS publication and the converted labspoon publication
        t.set(microsoftPublicationRef, microsoftPublication);
        const publication = makPublicationToPublication(microsoftPublication);
        delete publication.authors;
        delete publication.topics;
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

        microsoftPublication.F?.forEach((field) => {});
      });
    } catch (err) {
      console.error(err);
    }
  });

export const createTopicsFromNewMAKPublication = functions.firestore
  .document('MSPublications/{msPublicationID}')
  .onCreate(async (change, context) => {
    const microsoftPublication = change.data();
    const microsoftPublicationID = context.params.msPublicationID;
    const publicationTopicPromiseArray = microsoftPublication.F?.map(
      async (field: MAKField) => {
        return db.runTransaction((transaction) => {
          const fieldID = field.FId.toString();
          return transaction.get(db.doc(`MSFields/${fieldID}`)).then((qs) => {
            if (qs.exists) {
              return console.log('topic already created');
            }
            const microsoftField = field;
            const labspoonTopicDS = db.collection('topics').doc();
            const labspoonTopicID = labspoonTopicDS.id;
            microsoftField.processed = labspoonTopicID;
            transaction.set(labspoonTopicDS, makFieldToTopic(field));
            transaction.set(
              db.collection('MSFields').doc(fieldID),
              microsoftField
            );
            transaction.set(
              db
                .collection('MSFields')
                .doc(fieldID)
                .collection('publications')
                .doc(microsoftPublicationID),
              microsoftPublication
            );
          });
        });
      }
    );
    return Promise.all(publicationTopicPromiseArray);
  });

export const addNewMAKPublicationToTopics = functions.firestore
  .document('MSFields/{msFieldID}/publications/{msPublicationID}')
  .onCreate(async (change, context) => {
    const msFieldID = context.params.msFieldID;
    const msPublicationID = context.params.msPublicationID;

    // Find the topic that corresponds to the Microsoft field of study ID
    const topicQS = await db
      .collection('topics')
      .where('microsoftID', '==', msFieldID)
      .limit(1)
      .get();
    if (topicQS.empty) {
      console.error('topic not found; returning');
      return;
    }
    const topicDS = topicQS.docs[0];
    const topicID = topicDS.id;

    const publicationDS = await getPublicationByMicrosoftPublicationID(
      msPublicationID
    );
    const publicationID = publicationDS.id;

    try {
      await db.runTransaction(async (t) => {
        const publication = await t.get(
          db.doc(`publications/${publicationID}`)
        );
        t.set(
          db.doc(`topics/${topicID}/publications/${publicationID}`),
          publication.data()
        );
      });
    } catch (err) {
      console.error(err);
    }

    return null;
  });

export const addNewMAKPublicationToAuthors = functions.firestore
  .document('MSUsers/{msUserID}/publications/{msPublicationID}')
  .onCreate(async (change, context) => {
    const msUserID = context.params.msUserID;
    const msPublicationID = context.params.msPublicationID;

    // Check whether there is a labspoon user corresponding to the microsoft academic ID, otherwise do nothing.
    const userQS = await db
      .collection('users')
      .where('microsoftAcademicAuthorID', '==', msUserID)
      .limit(1)
      .get();
    if (userQS.empty) return null;
    const userDS = userQS.docs[0];

    // Find the publication
    const publicationDS = await getPublicationByMicrosoftPublicationID(
      msPublicationID
    );
    await db
      .doc(`users/${userDS.id}/publications/${publicationDS.id}`)
      .set(publicationDS.data());

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
