import * as functions from 'firebase-functions';
import {
  interpretationResult,
  interpretQuery,
  executeExpression,
  MAKPublication,
} from './microsoft';
import {
  allPublicationFields,
  publishAddPublicationRequests,
} from './publications';

const fieldNameExprRegex = /^Composite\(F.FN==\'(?<fieldName>[a-zA-Z0-9 -]+)\'\)$/;

export const topicSearch = functions.https.onCall(async (data) => {
  const topicQuery = data.topicQuery;
  if (topicQuery === undefined)
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A topic query must be provided'
    );
  // Get an array of up to 10 interpretations of the query and filter to ensure they match the field name pattern.
  const expressions: expressionField[] = await interpretQuery({
    query: topicQuery,
    complete: 1,
    count: 100,
  })
    .then((resp) =>
      resp.data.interpretations
        .map((result: interpretationResult) => result.rules[0].output.value)
        .map((expr: string): expressionField | null => {
          const match = fieldNameExprRegex.exec(expr);
          if (!match) return null;
          return {
            expr: `And(${expr}, Ty=='0')`,
            fieldName: match.groups!.fieldName,
          };
        })
        .filter((res: expressionField | null) => res !== null)
        .slice(0, 10)
    )
    .catch((err: Error) => {
      console.error(err);
      throw new functions.https.HttpsError('internal', 'An error occurred.');
    });
  const executePromises = expressions.map((fieldExpr) =>
    executeExpression({
      expr: fieldExpr.expr,
      count: 1,
      attributes: allPublicationFields,
    })
      .then(async (resp) => {
        const publications: MAKPublication[] = resp.data.entities;
        if (publications.length === 0) return;
        await publishAddPublicationRequests(publications);
        if (!publications[0].F) return;
        const topicMatch = publications[0].F!.find(
          (topic) => topic.FN! === fieldExpr.fieldName
        );
        return topicMatch;
      })
      .catch((err: Error) => {
        console.error(err);
        throw new functions.https.HttpsError('internal', 'An error occurred.');
      })
  );
  return await Promise.all(executePromises);
});

interface expressionField {
  expr: string;
  fieldName: string;
}

export interface Topic {
  id?: string;
  microsoftID: string;
  name: string;
  normalisedName?: string;
}
