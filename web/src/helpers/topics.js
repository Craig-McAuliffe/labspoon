// Retrieves paginated topics from the passed topic collection using the last
// topic of the previous page as a cursor. Returns a promise that returns an
// array of results when resolved. If there are no results, or the collection
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
