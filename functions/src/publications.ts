import * as functions from 'firebase-functions';
import {interpretQuery, executeExpression, makPublicationToPublication} from './microsoft';

export const microsoftAcademicKnowledgePublicationSearch = functions.https.onCall(
  async (data, context) => {
    let results;
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
          attributes: 'AA.DAuN,AA.AuId,DN',
        });
      })
      .then((resp) => {
        results = resp.data.entities.map(makPublicationToPublication);
      })
      .catch((err) => {
        console.error(err);
        throw new functions.https.HttpsError('internal', 'An error occured.');
      });
    return results;
  }
);