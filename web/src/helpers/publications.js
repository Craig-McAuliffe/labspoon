import React from 'react';
import {Link} from 'react-router-dom';

export function dbPublicationToJSPublication(dbPublication) {
  const JSPublication = dbPublication;
  if (JSPublication.resourceType === undefined) {
    JSPublication.resourceType = 'publication';
  }
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
    .catch((err) => console.error(err));
}

export function getLinkForAuthor(id, microsoftID, nameStr, backgroundShade) {
  if (id) {
    return <Link to={`/user/${id}`}>{nameStr}</Link>;
  } else if (microsoftID) {
    return (
      <Link
        className={`secondary-link-${
          backgroundShade ? backgroundShade : 'light'
        }`}
        to={`/externaluser/${microsoftID}`}
      >
        {nameStr}
      </Link>
    );
  } else {
    return nameStr;
  }
}

export function algoliaPublicationToDBPublicationListItem(algoliaPublication) {
  const publicationListItem = {
    id: algoliaPublication.id,
    date: algoliaPublication.date,
    title: algoliaPublication.title,
    authors: algoliaPublication.authors,
    topics: algoliaPublication.topics,
  };
  if (algoliaPublication.microsoftID)
    publicationListItem.microsoftID = algoliaPublication.microsoftID;
  if (algoliaPublication.filterTopicIDs)
    publicationListItem.filterTopicIDs = algoliaPublication.filterTopicIDs;
  if (algoliaPublication.filterAuthorIDs)
    publicationListItem.filterAuthorIDs = algoliaPublication.filterAuthorIDs;
  return publicationListItem;
}

// MS Publications have duplication
export function getUniqueAuthorsFromAuthors(authors) {
  const seenMicrosoftIDs = new Set();
  const seenLabspoonUserIDs = new Set();
  const uniqueAuthors = [];
  authors.forEach((possiblyDuplicateAuthor) => {
    if (!possiblyDuplicateAuthor.microsoftID && !possiblyDuplicateAuthor.id)
      return;
    if (!possiblyDuplicateAuthor.microsoftID) {
      if (seenLabspoonUserIDs.has(possiblyDuplicateAuthor.id)) return;
      uniqueAuthors.push(possiblyDuplicateAuthor);
      seenLabspoonUserIDs.add(possiblyDuplicateAuthor.id);
      return;
    }
    if (seenMicrosoftIDs.has(possiblyDuplicateAuthor.microsoftID)) return;
    uniqueAuthors.push(possiblyDuplicateAuthor);
    seenMicrosoftIDs.add(possiblyDuplicateAuthor.microsoftID);
  });
  return uniqueAuthors;
}
