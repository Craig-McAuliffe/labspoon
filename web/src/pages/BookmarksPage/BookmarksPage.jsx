import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext, FeatureFlags} from '../../App';

import FilterableResults, {
  NewResultsWrapper,
  NewFilterMenuWrapper,
  ResourceTabs,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';

import {getFilteredBookmarks} from '../../mockdata/bookmarks.js';

function fetchMockResults(skip, limit, filter) {
  return getFilteredBookmarks(filter).slice(skip, skip + limit);
}

function fetchBookmarks(uuid, skip, limit, filter, last) {
  console.log('trigger');
  let results = db
    .collection(`users/${uuid}/bookmarks`)
    .orderBy('bookmarkedResourceID');
  if (typeof last !== 'undefined') {
    results = results.startAt(last.timestamp);
  }
  return results
    .limit(limit)
    .get()
    .then((qs) => {
      const bookmarks = [];
      qs.forEach((doc) => {
        const bookmark = doc.data();
        bookmark.id = doc.id;
        bookmarks.push(bookmark);
      });
      return bookmarks;
    })
    .catch((err) => console.log(err));
}

const BookmarksPage = () => {
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  let fetchResults;
  if (!featureFlags.has('disable-cloud-firestore')) {
    fetchResults = (skip, limit, filter, last) =>
      fetchBookmarks(user.uid, skip, limit, filter, last);
  } else {
    fetchResults = fetchMockResults;
  }
  return (
    <div className="content-layout">
      <FilterableResults fetchResults={fetchResults} limit={10}>
        <div className="feed-container">
          <FilterManager>
            <ResourceTabs />
            <NewFilterMenuWrapper />
          </FilterManager>
          <NewResultsWrapper />
        </div>
      </FilterableResults>
    </div>
  );
};

export default BookmarksPage;
