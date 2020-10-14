import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {admin} from './config';
import {
  interpretQuery,
  executeExpression,
  makPublicationToPublication,
  Publication,
  MAKPublication,
} from './microsoft';

const pubSubClient = new PubSub();
const db = admin.firestore();

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
          attributes:
            'AA.AfId,AA.AfN,AA.AuId,AA.AuN,AA.DAuN,AA.DAfN,AA.S,AW,BT,BV,C.CId,C.CN,CC,CitCon,D,DN,DOI,E,ECC,F.DFN,F.FId,F.FN,FamId,FP,I,IA,Id,J.JId,J.JN,LP,PB,Pt,RId,S,Ti,V,VFN,VSN,W,Y',
        });
      })
      .then((resp) => {
        resp.data.entities.forEach((result: object) => {
          const jsonString = JSON.stringify(result);
          const messageBuffer = Buffer.from(jsonString);
          pubSubClient
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
        results = resp.data.entities.map(makPublicationToPublication);
      })
      .catch((err) => {
        console.error(err);
        throw new functions.https.HttpsError('internal', 'An error occured.');
      });

    return results;
  }
);

export const addNewMSPublicationAsync = functions.pubsub
  .topic('add-publication')
  .onPublish(async (message) => {
    if (!message.json) return;
    const microsoftPublication = message.json as MAKPublication;
    if (!microsoftPublication.Id) return;
    const microsoftPublicationID = microsoftPublication.Id.toString();
    const microsoftPublicationRef = db.collection('MSPublications').doc(microsoftPublicationID);
    try {
      await db.runTransaction(async (t) => {
        const microsoftPublicationDS = await t.get(microsoftPublicationRef);

        // If the Microsoft publication has been added and marked as processed then the labspoon publication must already exist 
        if (microsoftPublicationDS.exists) {
          const microsoftPublicationDSData = microsoftPublicationDS.data() as MAKPublication;
          if (microsoftPublicationDSData.processed) return;
        }

        microsoftPublication.processed = true;

        // store the MS publication and 
        t.set(microsoftPublicationRef, microsoftPublication);
        const publication = makPublicationToPublication(microsoftPublication);
        // TODO(Patrick): Reintroduce authors
        delete publication.authors;
        t.set(db.collection('publications').doc(), publication);

        microsoftPublication.AA?.forEach((author) =>{
        const authorID = author.AuId.toString();
          t.set(db.collection('MSUsers').doc(authorID), author);
          t.set(
            db
              .collection('MSUsers')
              .doc(author.AuId.toString())
              .collection('publications')
              .doc(microsoftPublicationID),
            microsoftPublication
          )
        });
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

      // Check whether there is a labspoon user with this ID, otherwise do nothing.
      const userQS = await db
        .collection('users')
        .where('microsoftAcademicAuthorID', '==', msUserID)
        .limit(1)
        .get();
      if (userQS.empty) return null;
      const userDS = userQS.docs[0];

      // Find the publication
      const publicationsQS = await db.collection('publications').where('microsoftID', '==', msPublicationID).limit(1).get();
      if (publicationsQS.empty) {
        console.log('No publication found with Microsoft Publication ID ', msPublicationID, ' this should not happen and likely indicates a logic issue.');
      }
      const publicationDS = publicationsQS.docs[0];
      await db.doc(`users/${userDS.id}/publications/${publicationDS.id}`).set(publicationDS.data());

      return null;
    });