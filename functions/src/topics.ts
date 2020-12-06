import * as functions from 'firebase-functions';
import {
  interpretationResult,
  interpretQuery,
  executeExpression,
  MAKPublication,
  makPublicationToPublication,
  MAKField,
} from './microsoft';
import {
  allPublicationFields,
  publishAddPublicationRequests,
} from './publications';
import {admin} from './config';

const db = admin.firestore();

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
        if (publications.length === 0) return undefined;
        await publishAddPublicationRequests(publications);

        const publication = makPublicationToPublication(publications[0]);
        if (!publication.topics) return undefined;
        const topicMatch = publication.topics.find(
          (topic) => topic.normalisedName === fieldExpr.fieldName
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

export async function createFieldAndTopic(topic: Topic) {
  const MSFieldID = topic.microsoftID;
  return db
    .runTransaction((transaction) => {
      const labspoonTopicRef = db.collection('topics').doc();
      const labspoonTopicID = labspoonTopicRef.id;

      return transaction.get(db.doc(`MSFields/${MSFieldID}`)).then((ds) => {
        if (ds.exists) {
          if (ds.data()!.processed === undefined) {
            console.error(
              `this MSField has no corresponding labspoon topic ${MSFieldID}`
            );
            transaction.set(labspoonTopicRef, topic);
            transaction.update(db.doc(`MSFields/MSFieldID`), {
              processed: labspoonTopicID,
            });
            return labspoonTopicID;
          }
          return ds.data()!.processed;
        }
        const processedMicrosoftField: MAKField = {
          DFN: topic.name,
          FId: Number(MSFieldID),
          FN: topic.normalisedName,
          processed: labspoonTopicID,
        };

        transaction.set(labspoonTopicRef, topic);
        transaction.set(
          db.collection('MSFields').doc(MSFieldID),
          processedMicrosoftField
        );
        return labspoonTopicID;
      });
    })
    .catch((err) => {
      console.error(
        `Could not create topic and field ${topic} from MSPublication:`,
        err,
      );
      throw new functions.https.HttpsError(
        'internal',
        `An error occurred while processing the field, ${topic}`
      );
    });
}

export function convertTaggedTopicToTopic(
  taggedTopic: TaggedTopic,
  rank?: boolean
) {
  const topic: Topic = {
    name: taggedTopic.name,
    normalisedName: taggedTopic.normalisedName,
    microsoftID: taggedTopic.microsoftID,
  };
  if (rank) topic.rank = 1;
  return topic;
}

export function convertTopicToTaggedTopic(topic: Topic, topicID: string) {
  const taggedTopic: TaggedTopic = {
    name: topic.name,
    normalisedName: topic.normalisedName,
    id: topicID,
    microsoftID: topic.microsoftID,
  };
  return taggedTopic;
}

interface expressionField {
  expr: string;
  fieldName: string;
}

// Rank relates to how often the resource mentions this topic
export interface Topic {
  id?: string;
  microsoftID: string;
  name: string;
  normalisedName: string;
  rank?: number;
}

export interface TaggedTopic {
  id: string;
  microsoftID: string;
  name: string;
  normalisedName: string;
}
