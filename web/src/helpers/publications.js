export function dbPublicationToJSPublication(dbPublication) {
  console.log(dbPublication);
  const JSPublication = dbPublication;
  if (JSPublication.resourceType === undefined) {
    JSPublication.resourceType = 'publication';
  }
  JSPublication.content = {};
  JSPublication.content.authors = dbPublication.authors;
  JSPublication.content.abstract = dbPublication.abstract;
  return JSPublication;
}

// Retrieves paginated publications from the passed publications collection
// using the last publications of the previous page as a cursor. Returns
// a promise that returns an array of results when resolved. If there are no
// results, or the collection does not exist, an empty array of results is
// returned.
export function getPaginatedPublicationsFromCollectionRef(
  publicationCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    publicationCollection = publicationCollection.startAt(last.timestamp);
  }
  return publicationCollection
    .limit(limit)
    .get()
    .then((qs) => {
      const publications = [];
      qs.forEach((doc) => {
        const publication = dbPublicationToJSPublication(doc.data());
        publication.id = doc.id;
        publications.push(publication);
      });
      return publications;
    })
    .catch((err) => console.log(err));
}
