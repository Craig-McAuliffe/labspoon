import React from 'react';
import {Link} from 'react-router-dom';

export function dbPublicationToJSPublication(dbPublication) {
  const JSPublication = dbPublication;
  if (JSPublication.resourceType === undefined) {
    JSPublication.resourceType = 'publication';
  }
  JSPublication.content = {};
  JSPublication.content.authors = dbPublication.authors;
  JSPublication.content.abstract = dbPublication.abstract;
  return JSPublication;
}

export function jsPublicationToDBPublication(jsPublication) {
  const dbPublication = {...jsPublication};
  delete dbPublication.resourceType;
  delete dbPublication.content;
  delete dbPublication.id;
  return dbPublication;
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
  publicationCollection = publicationCollection.orderBy('date', 'desc');
  if (typeof last !== 'undefined') {
    publicationCollection = publicationCollection.startAfter(last.date);
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

export function getLinkForAuthor(id, microsoftID, nameStr) {
  if (id) {
    return <Link to={`/user/${id}`}>{nameStr}</Link>;
  } else if (microsoftID) {
    return (
      <Link className="secondary-link" to={`/externaluser/${microsoftID}`}>
        {nameStr}
      </Link>
    );
  } else {
    return nameStr;
  }
}
