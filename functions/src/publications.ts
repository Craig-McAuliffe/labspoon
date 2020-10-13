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

export const addNewPublicationAsync = functions.pubsub
  .topic('add-publication')
  .onPublish(async (message) => {
    if (!message.json) return;
    const microsoftPublication = message.json as MAKPublication;
    if (!microsoftPublication.Id) return;
    const microsoftPublicationID = microsoftPublication.Id as number;
    const microsoftPublicationRef = db.collection('MAPublications').doc(microsoftPublicationID.toString());
    // Keep the extra Microsoft data for later
    microsoftPublicationRef.set(microsoftPublication, {merge: true});

    const publication = makPublicationToPublication(microsoftPublication);
    // TODO(Patrick): Reintroduce authors
    delete publication.authors;
    try {
      await db.runTransaction(async (t) => {
        const microsoftPublicationDS = await t.get(microsoftPublicationRef);

        // If the Microsoft publication has been added and marked as processed then the labspoon publication must already exist 
        if (microsoftPublicationDS.exists) {
          const microsoftPublicationDSData = microsoftPublicationDS.data() as MAKPublication;
          if (microsoftPublicationDSData.processed) return;
        }

        microsoftPublication.processed = true;
        t.set(microsoftPublicationRef, microsoftPublication);
        t.set(db.collection('publications').doc(), publication);
      });
    } catch (err) {
      console.error(err);
    }
    return null;
  });
