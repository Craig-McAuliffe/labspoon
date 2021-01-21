// Retrieves paginated topics from the passed topic collection using the last
// topic of the previous page as a cursor. Returns a promise that returns an
// array of results when resolved. If there are no results, or the collection

import {db} from '../firebase';

// does not exist, an empty array of results is returned.
export function getPaginatedTopicsFromCollectionRef(
  topicCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    topicCollection = topicCollection.startAt(last.id);
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

export function handleTaggedTopicsNoIDs(taggedResourceTopics, collectedTopics) {
  const mappingTopicsPromises = taggedResourceTopics.map(
    async (taggedTopicNoID) => {
      return db
        .doc(`MSFields/${taggedTopicNoID.microsoftID}`)
        .get()
        .then(async (ds) => {
          function addLabspoonTopicToTaggedResource(
            correspondingLabspoonTopicID
          ) {
            collectedTopics.push(
              convertTopicToTaggedTopic(
                taggedTopicNoID,
                correspondingLabspoonTopicID
              )
            );
          }
          if (ds.exists) {
            const MSFieldData = ds.data();
            if (MSFieldData.processed)
              addLabspoonTopicToTaggedResource(MSFieldData.processed);
            else {
              // This should not be possible. All dbMSFields should be processed
              // upon creation.
              console.error(
                'no Labspoon topic corresponding to MSField ' +
                  taggedTopicNoID.microsoftID
              );
            }
          } else {
            const labspoonTopicID = await waitThenReFetchMSField(
              taggedTopicNoID
            );
            if (labspoonTopicID === undefined) {
              console.error(
                `could not find MSField with id ${taggedTopicNoID.microsoftID} after delayed refetch`
              );
            } else {
              addLabspoonTopicToTaggedResource(labspoonTopicID);
            }
          }
        })
        .catch((err) =>
          console.error(
            `could not fetch msfield with id ${taggedTopicNoID.microsoftID}, therefore the topic has not been added ${err}`
          )
        );
    }
  );
  return Promise.all(mappingTopicsPromises);
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
    normalisedName: topic.normalisedName,
    id: topicID,
    microsoftID: topic.microsoftID,
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
