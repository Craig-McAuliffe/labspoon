import React from 'react';

import FilterableResults from '../../components/FilterableResults/FilterableResults';

import {
  getFilteredBookmarks,
  getBookmarkFilters,
} from '../../mockdata/bookmarks.js';

function fetchResults(skip, limit, filter) {
  return getFilteredBookmarks(filter).slice(skip, skip + limit);
}

const filterOptionsData = getBookmarkFilters();

const BookmarksPage = () => {
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
