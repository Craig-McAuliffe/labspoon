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
  MAKPublicationInDB,
  MAKAuthor,
  User,
  makAuthorToAuthor,
  makSourceToSource,
  Source,
} from './microsoft';
import {Post} from './posts';
import {Topic, createFieldAndTopic, convertTopicToTaggedTopic} from './topics';

const pubSubClient = new PubSub();
const db = admin.firestore();

export const allPublicationFields =
  'AA.AfId,AA.AfN,AA.AuId,AA.AuN,AA.DAuN,AA.DAfN,AA.S,AW,BT,BV,C.CId,C.CN,CC,CitCon,D,DN,DOI,E,ECC,F.DFN,F.FId,F.FN,FamId,FP,I,IA,Id,J.JId,J.JN,LP,PB,Pt,RId,S,Ti,V,VFN,VSN,W,Y';

interface PublicationSearchResponse {
  results: Publication[];
  expression: string;
}

// Used for interpreting and evaluating a search query.
interface PublicationSearchQuery {
  query: string;
  limit: number;
}

// Used for only evaluating a search query.
interface PublicationSearchExpression {
  // An expression using the microsoft academic query expression syntax https://docs.microsoft.com/en-us/academic-services/project-academic-knowledge/reference-query-expression-syntax
  expression: string;
  limit: number;
  offset: number;
}

type PublicationSearchRequest =
  | PublicationSearchQuery
  | PublicationSearchExpression;

export const microsoftAcademicKnowledgePublicationSearch = functions.https.onCall(
  async (
    data: PublicationSearchRequest
  ): Promise<PublicationSearchResponse> => {
    const response: PublicationSearchResponse = {results: [], expression: ''};

    const count = data.limit;
    let expression: string;
    let offset: number;
    const publicationSearchExpression = data as PublicationSearchExpression;
    if (publicationSearchExpression.expression !== undefined) {
      expression = publicationSearchExpression.expression;
      offset = publicationSearchExpression.offset;
    } else {
      const publicationSearchQuery = data as PublicationSearchQuery;
      const interpretationResponse = await interpretQuery({
        query: publicationSearchQuery.query,
        complete: 1,
        count: 1,
      }).catch((err) => {
        // If the error is well defined re-throw it.
        if (err.code) throw err;
        console.error(
          'Error raised interpreting a query in the publication search:',
          err
        );
        throw new functions.https.HttpsError('internal', 'An error occured.');
      });
      if (!interpretationResponse) return response;
      expression =
        interpretationResponse.data.interpretations[0].rules[0].output.value;
      offset = 0;
    }

    const executeResponse = await executeExpression({
      // `Ty='0'` retrieves only publication type results
      // https://docs.microsoft.com/en-us/academic-services/project-academic-knowledge/reference-entity-attributes
      expr: `And(${expression}, Ty='0')`,
      count: count,
      offset: offset,
      attributes: allPublicationFields,
    }).catch((err) => {
      // If the error is well defined re-throw it.
      if (err.code) throw err;
      throw new functions.https.HttpsError('internal', 'An error occured.');
    });
    if (!executeResponse) return response;
    const publications = executeResponse.data.entities;
    await publishAddPublicationRequests(publications);
    response.results = publications.map(makPublicationToPublication);
    response.expression = expression;
    return response;
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
      const createPublicationsTransaction = await db.runTransaction(
        async (t) => {
          const microsoftPublicationDS = await t.get(microsoftPublicationRef);
          const labspoonPublicationRef = db.collection('publications').doc();
          const labspoonPublicationID = labspoonPublicationRef.id;
          const labspoonPublication = makPublicationToPublication(microsoftPublication);
          const dataToLinkTopicsAndPub = {
            publication: labspoonPublication,
            labspoonPublicationID: labspoonPublicationID,
            taggedTopicsNoID: labspoonPublication.topics,
          };
          // If the Microsoft publication has been added and marked as processed then the labspoon publication must already exist
          if (microsoftPublicationDS.exists) {
            const microsoftPublicationDSData = microsoftPublicationDS.data() as MAKPublication;
            if (microsoftPublicationDSData.processed)
              return dataToLinkTopicsAndPub;
            // Publications should always be processed. This should not happen.
            t.set(labspoonPublicationRef, labspoonPublication);
            t.update(microsoftPublicationRef, {
              processed: labspoonPublicationID,
            });
            return dataToLinkTopicsAndPub;
          }
          microsoftPublication.processed = labspoonPublicationID;
          // store the MS publication and the converted labspoon publication
          t.set(microsoftPublicationRef, microsoftPublication);
          delete labspoonPublication.authors;
          labspoonPublication.topics = [];
          t.set(labspoonPublicationRef, labspoonPublication);

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
          return dataToLinkTopicsAndPub;
        }
      );
      const publicationID = createPublicationsTransaction.labspoonPublicationID;
      const publication = createPublicationsTransaction.publication;
      createTopicsFromNewPubAndAddPubToTopic(
        publication,
        publicationID,
        createPublicationsTransaction.taggedTopicsNoID
      ).catch((err) =>
        console.error(
          'Error raised whilst creating a new topic from publication:',
          err
        )
      );
      await fulfillOutgoingReferencesOnLabspoon(publicationID);
      await fulfillIncomingReferencesOnLabspoon(
        publicationID,
        microsoftPublicationID
      );
      return true;
    } catch (err) {
      console.error(err);
    }

    return true;
  });

export async function createTopicsFromNewPubAndAddPubToTopic(
  publication: Publication,
  publicationID: string,
  taggedTopicsNoID?: Topic[]
) {
  if (!taggedTopicsNoID) return undefined;
  const publicationTopicPromiseArray = taggedTopicsNoID.map(
    async (taggedTopicNoID: Topic) => {
      return createFieldAndTopic(taggedTopicNoID)
        .then((labspoonTopicID) => {
          connectPublicationWithTopic(
            publicationID,
            publication,
            labspoonTopicID
          ).catch((err) =>
            console.error(
              `could not add the publication to the Labspoon Topic, ${err}`
            )
          );
        })
        .catch((err) =>
          console.error(
            `could not create Field and Topic for topic with microsoft ID ${taggedTopicNoID.microsoftID}, ${err}`
          )
        );
    }
  );
  return Promise.all(publicationTopicPromiseArray);
}

export async function connectPublicationWithTopic(
  publicationID: string,
  publication: Publication,
  labspoonTopicID: string
) {
  await db
    .doc(`topics/${labspoonTopicID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) {
        console.error(`topic with id ${labspoonTopicID} not found; returning`);
        return undefined;
      }
      const topicData = ds.data()! as Topic;
      // Tagged topics have an id field
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
            `could not connect publication with id ${publicationID} to topic with id ${labspoonTopicID}, ${err}`
          );
        });
    });
  return true;
}

export const addNewMAKPublicationToAuthors = functions.firestore
  .document('MSUsers/{msUserID}/publications/{msPublicationID}')
  .onCreate(async (_, context) => {
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

export const addSourcesToExistingPublications = functions.https.onRequest(
  async (_, res) => {
    const msPublicationsQS = await db.collection('MSPublications').get();
    if (msPublicationsQS.empty) {
      res.status(200).send();
      return;
    }

    const promises: Promise<any>[] = [];
    msPublicationsQS.forEach((ds) => {
      if (!ds.exists) return;
      const msPublication = ds.data() as MAKPublicationInDB;

      const publicationID = msPublication.processed;
      // This should not happen as publications are created in a transaction.
      if (!publicationID) return;

      let sources: Source[] = [];
      if (msPublication.S) {
        sources = msPublication.S.map((s) => makSourceToSource(s));
      }

      const writePromise = db
        .collection('publications')
        .doc(publicationID)
        .update({
          sources: sources,
        })
        .catch((err) => {
          console.error(
            `An error occurred adding sources to the publication with ID ${publicationID}`,
            err
          );
          throw new functions.https.HttpsError('internal', 'An error occured.');
        });
      promises.push(writePromise);
    });

    await Promise.all(promises);
    res.status(200).send();
  }
);

// Adds referenced microsoft publication IDs to existing publications that do
// not have this field populated. This function is idempotent, but should only
// be run once after the updates to the add publication function are made that
// add the referenced microsoft publication IDs for new publications.
export const addReferencedMicrosoftIDsToExistingPublications = functions.https.onRequest(
  async (_, res) => {
    const msPublicationsQS = await db.collection('MSPublications').get();
    if (msPublicationsQS.empty) {
      res.status(200).send();
      return;
    }
    const promises: Promise<any>[] = [];
    msPublicationsQS.forEach((ds) => {
      if (!ds.exists) return;
      const msPublication = ds.data() as MAKPublicationInDB;

      const publicationID = msPublication.processed;
      // This should not happen as publications are created in a transaction.
      if (!publicationID) return;

      if (!msPublication.RId) return;
      const referenceIDs: string[] = msPublication.RId.map((strid) =>
        strid.toString()
      );

      const promise = db
        .runTransaction(async (t) => {
          const publicationRef = db.doc(`publications/${publicationID}`);
          const publicationDS = await t.get(publicationRef);
          if (!publicationDS.exists) return;
          const publication = publicationDS.data() as Publication;
          // If the field is already populated we don't want to overwrite as this
          // would incur additional reference resolution operations with no effect.
          if (publication.referencedPublicationMicrosoftIDs) return;
          t.update(publicationRef, {
            referencedPublicationMicrosoftIDs: referenceIDs,
          });
        })
        .catch((err) => {
          console.error(
            `An error occurred adding referenced microsoft publication IDs to the publication with ID ${publicationID}`,
            err
          );
          throw new functions.https.HttpsError('internal', 'An error occured.');
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    res.status(200).send();
  }
);

export const triggerFulfillReferencesOnLabspoon = functions.https.onRequest(
  async (_, res) => {
    const publicationsQS = await db.collection('publications').get();
    if (publicationsQS.empty) {
      res.status(200).send();
      return;
    }
    const promises: Promise<any>[] = [];
    publicationsQS.forEach((ds) =>
      promises.push(fulfillOutgoingReferencesOnLabspoon(ds.id, ds))
    );
    await Promise.all(promises).catch((err) =>
      res
        .status(500)
        .send('An error occurred whilst fulfilling references: ' + err)
    );
    res.status(200).send();
    return;
  }
);

// For a publication with ID `publicationID`, if the publication references any
// publications that are currently on Labspoon add those references to the
// publication's reference collection.
async function fulfillOutgoingReferencesOnLabspoon(
  publicationID: string,
  publicationDSArg:
    | FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
    | undefined = undefined
) {
  const referencingPublicationRef = db
    .collection('publications')
    .doc(publicationID);
  let publicationDS = publicationDSArg;
  if (!publicationDS) {
    publicationDS = await referencingPublicationRef.get().catch((err) => {
      throw new Error(
        `Unable to retrieve publication with ID ${publicationID}: ${err}`
      );
    });
    if (!publicationDS.exists)
      throw new Error(`No publication with ID ${publicationID} exists`);
  }
  const publication = publicationDS.data() as Publication;
  const referencedMicrosoftIDs = publication.referencedPublicationMicrosoftIDs;
  if (!referencedMicrosoftIDs || referencedMicrosoftIDs.length === 0) return;
  const promises = referencedMicrosoftIDs.map(async (microsoftID) => {
    const msPublicationDS = await db
      .collection('MSPublications')
      .doc(microsoftID)
      .get()
      .catch((err) => {
        throw Error(
          `Unable to get MSPublication with id ${microsoftID}: ` + err
        );
      });
    // If we can't find the publication on Labspoon, we do not add it here. See #441 for justifictions.
    if (!msPublicationDS.exists) return;
    const msPublication = msPublicationDS.data() as MAKPublicationInDB;
    const lsPublicationID = msPublication.processed;
    // This shouldn't happen as we create the MS publication and Labspoon publication in a transaction.
    if (!lsPublicationID)
      console.error(
        `MSPublication with ID ${microsoftID} has not been processed.`
      );
    const lsPublicationRef = db.doc(`publications/${lsPublicationID}`);
    const lsPublicationDS = await lsPublicationRef.get().catch((err) => {
      throw Error(
        `Unable to get publication with id ${lsPublicationID}: ` + err
      );
    });
    if (!lsPublicationDS)
      console.error(
        `MSPublication ${microsoftID} has been marked as processed into labspoon publication ${lsPublicationID} but this publication does not exist`
      );
    const lsPublication = lsPublicationDS.data() as Publication;
    const batch = db.batch();
    batch.set(
      referencingPublicationRef.collection('references').doc(lsPublicationID!),
      toPublicationRef(lsPublicationID!, lsPublication)
    );
    batch.update(referencingPublicationRef, {
      referencedPublicationMicrosoftIDs: adminNS.firestore.FieldValue.arrayRemove(
        microsoftID
      ),
    });
    await batch.commit();
    return;
  });
  await Promise.all(promises);
  return;
}

// For a publication on Labspoon with ID `publicationID` add the publication to
// the references of all publications that reference it.
async function fulfillIncomingReferencesOnLabspoon(
  publicationID: string,
  msPublicationID: string
) {
  const referencingPublicationsQS = await db
    .collection('publications')
    .where(
      'referencedPublicationMicrosoftIDs',
      'array-contains',
      msPublicationID
    )
    .get();
  if (referencingPublicationsQS.empty) return;

  const publicationDS = await db
    .doc(`publications/${publicationID}`)
    .get()
    .catch((err) => {
      throw Error(`Unable to get publication with id ${publicationID}: ` + err);
    });
  if (!publicationDS.exists) {
    console.error(
      `No publication found with ID ${publicationID}. This should not happen.`
    );
    return;
  }
  const publication = publicationDS.data() as Publication;

  const addReferencePromises: Promise<null>[] = [];
  referencingPublicationsQS.forEach(async (referencingPublicationDS) => {
    const referencingPublicationRef = referencingPublicationDS.ref;
    const batch = db.batch();
    batch.set(
      referencingPublicationRef.collection('references').doc(publicationID),
      toPublicationRef(publicationID, publication)
    );
    batch.update(referencingPublicationRef, {
      referencedPublicationMicrosoftIDs: adminNS.firestore.FieldValue.arrayRemove(
        msPublicationID
      ),
    });
    await batch.commit();
    return;
  });

  await Promise.all(addReferencePromises);
  return;
}

// Helper function that adds a publication to the DB by its microsoft publication ID
export const addMicrosoftPublicationByID = functions.https.onRequest(
  async (req, res) => {
    const publicationID = req.query.id;
    const executeResponse = await executeExpression({
      // `Ty='0'` retrieves only publication type results
      // https://docs.microsoft.com/en-us/academic-services/project-academic-knowledge/reference-entity-attributes
      expr: `And(Id=${publicationID}, Ty='0')`,
      count: 1,
      offset: 0,
      attributes: allPublicationFields,
    }).catch((err) => {
      // If the error is well defined re-throw it.
      if (err.code) throw err;
      throw new functions.https.HttpsError('internal', 'An error occured.');
    });
    const publications = executeResponse.data.entities;
    await publishAddPublicationRequests(publications);
    res.status(200).send();
    return;
  }
);

// Authors are associated with a publication after the publication's creation,
// so this function updates references to that publication when the authors are
// added.
export const updateReferencesToPublication = functions.firestore
  .document('publications/{publicationID}')
  .onUpdate(async (change, _) => {
    const publicationID = change.after.id;
    const publication = change.after.data() as Publication;
    const publicationRefQS = await db
      .collectionGroup('references')
      .where('id', '==', publicationID)
      .get();
    if (publicationRefQS.empty) return;
    const writePromises: Promise<any>[] = [];
    publicationRefQS.forEach((publicationDS) => {
      const writePromise = publicationDS.ref.set(
        toPublicationRef(publicationID, publication)
      );
      writePromises.push(writePromise);
    });
    return Promise.all(writePromises);
  });

export const retrieveReferencesFromMicrosoft = functions.https.onCall(
  async (data) => {
    const publicationID = data.publicationID;
    const publicationDS = await db
      .doc(`publications/${publicationID}`)
      .get()
      .catch((err) => {
        console.error(
          `An error occurred whilst retrieving the publication with ID ${publicationID}:`,
          err
        );
        throw new functions.https.HttpsError(
          'internal',
          'Something went wrong.'
        );
      });
    if (!publicationDS.exists)
      throw new functions.https.HttpsError(
        'not-found',
        'Publication not found.'
      );
    const publication = publicationDS.data() as Publication;
    const referencedIDs = publication.referencedPublicationMicrosoftIDs;

    // Microsoft Academic only allows retrieving up to 10 results by ID at a time.
    const batchedIDs = [];
    while (referencedIDs.length !== 0) {
      batchedIDs.push(referencedIDs.splice(0, 10));
    }

    const publicationPromises: Promise<void>[] = batchedIDs.map(
      async (batch) => {
        const idConditions = batch.map((id) => `Id=${id}`);
        const expr = `OR(${idConditions.toString()})`;
        const executeResponse = await executeExpression({
          expr: expr,
          count: 10,
          offset: 0,
          attributes: allPublicationFields,
        }).catch((err) => {
          console.error(
            `An error occurred executing an expression on Microsoft Academic, the expression was ${expr}:`,
            err
          );
          // If the error is well defined re-throw it.
          if (err.code) throw err;
          throw new functions.https.HttpsError('internal', 'An error occured.');
        });
        const publications = executeResponse.data.entities;
        await publishAddPublicationRequests(publications);
        return;
      }
    );
    await Promise.all(publicationPromises);
    return true;
  }
);

// Returns suggested publications for display on the publications page.
export const suggestedPublications = functions.https.onCall(
  async (publicationID) => {
    const publicationDS = await db
      .collection('publications')
      .doc(publicationID)
      .get()
      .catch((err) => {
        console.error(
          `Unable to retrieve publication with ID ${publicationID}:`,
          err
        );
        throw new functions.https.HttpsError('internal', 'An error occured.');
      });
    if (!publicationDS.exists)
      throw new functions.https.HttpsError(
        'not-found',
        'No matching publication found'
      );

    const publication = publicationDS.data() as Publication;
    const topics = publication.topics;
    if (!topics || topics.length === 0) return;
    const suggestedPublicationPromises = topics
      .map(async (topic) => {
        const topicID = topic.id;
        const suggestedPublicationsForTopicQS = await db
          .collection(`topics/${topicID}/publications`)
          .orderBy('date')
          .limit(11)
          .get();
        if (suggestedPublicationsForTopicQS.empty) return [];
        const suggestedPublicationsFromTopic = suggestedPublicationsForTopicQS.docs.map(
          (suggestedPublicationsForTopicDS) => {
            return toPublicationRef(suggestedPublicationsForTopicDS.id, suggestedPublicationsForTopicDS.data() as Publication);
          });
        return suggestedPublicationsFromTopic;
      });
    const suggestedPublicationsArrayOfArrays = await Promise.all(
      suggestedPublicationPromises
    );
    // flatten the array of arrays
    const suggestedPublicationsNotUnique: PublicationRef[] = ([] as PublicationRef[]).concat.apply(
      [],
      suggestedPublicationsArrayOfArrays
    );

    // deduplicate the publications in the array
    const seenIDs = new Set();
    seenIDs.add(publicationID);
    const suggestedPublicationsDeduplicated: PublicationRef[] = [];
    suggestedPublicationsNotUnique.forEach((publicationNotUnique) => {
      if (seenIDs.has(publicationNotUnique.id)) return;
      suggestedPublicationsDeduplicated.push(publicationNotUnique);
      seenIDs.add(publicationNotUnique.id);
    });

    // randomly select 10 items from the array
    const suggestions: PublicationRef[] = [];
    for (let i = 0; i < 10; i++) {
      const index = Math.floor(Math.random() * suggestedPublicationsDeduplicated.length);
      const removed = suggestedPublicationsDeduplicated.splice(index, 1);
      // Since we are only removing one element
      suggestions.push(removed[0]);
    }

    const filteredForNulls = suggestions.filter((pub) => pub !== null);
    return filteredForNulls;
  }
);

function toPublicationRef(
  publicationID: string,
  input: Publication
): PublicationRef {
  return {
    id: publicationID,
    date: input.date!,
    title: input.title!,
    authors: input.authors!,
    topics: input.topics!,
  };
}

interface PublicationRef {
  // This field is required so we can find references to a publication in
  // a collection group.
  id: string;
  date: string;
  title: string;
  authors: Array<User>;
  topics: Topic[];
}
