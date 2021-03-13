// Retrieves paginated topics from the passed topic collection using the last
// topic of the previous page as a cursor. Returns a promise that returns an
// array of results when resolved. If there are no results, or the collection

import {db} from '../firebase';

// does not exist, an empty array of results is returned.
export function getPaginatedTopicsFromCollectionRef(
  topicCollection,
  limit,
  last,
  hasRank
) {
  if (hasRank) {
    topicCollection = topicCollection
      .orderBy('rank', 'desc')
      .orderBy('name', 'asc');
    if (last)
      topicCollection = topicCollection.startAfter(last.rank, last.name);
  } else {
    topicCollection = topicCollection.orderBy('name');
    if (typeof last !== 'undefined') {
      if (last) topicCollection = topicCollection.startAfter(last.name);
    }
  }

  return topicCollection
    .limit(limit)
    .get()
    .then((qs) => {
      const topics = [];
      qs.forEach((doc) => {
        const topic = doc.data();
        topic.id = doc.id;
        topic.resourceType = 'topic';
        topics.push(topic);
      });
      return topics;
    })
    .catch((err) => console.log(err));
}

export async function waitThenReFetchMSField(topic) {
  const MSFieldID = topic.microsoftID;
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(true), 4000);
  });
  await timeoutPromise;

  return db
    .doc(`MSFields/${MSFieldID}`)
    .get()
    .then(async (ds) => {
      if (!ds.exists) return undefined;
      const msFieldData = ds.data();
      if (msFieldData.processed === undefined) return undefined;
      return msFieldData.processed;
    })
    .catch((err) => {
      console.error(`Could not fetch MSField with id ${MSFieldID}` + err, err);
    });
}

export function convertTopicToTaggedTopic(topic, topicID) {
  const taggedTopic = {
    name: topic.name,
    normalisedName: topic.normalisedName ? topic.normalisedName : null,
    id: topicID,
    microsoftID: topic.microsoftID ? topic.microsoftID : null,
  };
  return taggedTopic;
}

export function TopicToMAKField(topic) {
  return {
    FId: Number(topic.microsoftID),
    DFN: topic.name,
    FN: topic.normalisedName,
  };
}
