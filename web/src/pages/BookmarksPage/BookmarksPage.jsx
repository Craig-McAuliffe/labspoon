import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext, FeatureFlags} from '../../App';

import FilterableResults from '../../components/FilterableResults/FilterableResults';

import {
  getFilteredBookmarks,
  getBookmarkFilters,
} from '../../mockdata/bookmarks.js';

function fetchMockResults(skip, limit, filter) {
  return getFilteredBookmarks(filter).slice(skip, skip + limit);
}

function fetchBookmarks(uuid, skip, limit, filter, last) {
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

const filterOptionsData = getBookmarkFilters();

const BookmarksPage = () => {
  const featureFlags = useContext(FeatureFlags);
  const user = useContext(AuthContext);

  let fetchResults;
  if (featureFlags.has('cloud-firestore')) {
    fetchResults = (skip, limit, filter, last) =>
      fetchBookmarks(user.uid, skip, limit, filter, last);
  } else {
    fetchResults = fetchMockResults;
  }
  return (
    <FilterableResults
      fetchResults={fetchResults}
      defaultFilter={filterOptionsData}
      limit={10}
      useTabs={false}
    />
  );
};

export default BookmarksPage;
