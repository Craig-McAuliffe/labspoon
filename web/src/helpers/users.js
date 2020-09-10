// Retrieves paginated user references from passed user reference collection
// for use in results pages. Returns a promise that returns an array of results
// when resolved. If there are no results, or the collection does not exist, an
// empty array of results is returned.
export function getPaginatedUserReferencesFromCollectionRef(
  userRefCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    userRefCollection = userRefCollection.startAt(last.id);
  }
  return userRefCollection
    .limit(limit)
    .get()
    .then((qs) => {
      const users = [];
      qs.forEach((doc) => {
        const user = doc.data();
        user.resourceType = 'user';
        users.push(user);
      });
      return users;
    });
}
