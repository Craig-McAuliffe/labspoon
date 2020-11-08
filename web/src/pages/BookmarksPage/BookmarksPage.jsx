import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext} from '../../App';

import FilterableResults, {
  NewResultsWrapper,
  NewFilterMenuWrapper,
  ResourceTabs,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';

function fetchBookmarks(uuid, skip, limit, filter, last) {
  let results = db
    .collection(`users/${uuid}/bookmarks`)
    .orderBy('bookmarkedResourceID');
  if (typeof last !== 'undefined') {
    results = results.startAt(last.timestamp);
  }
  return [
    results
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
      .catch((err) => console.log(err)),
    null,
  ];
}

const BookmarksPage = () => {
  const {user} = useContext(AuthContext);

  const fetchResults = (skip, limit, filter, last) =>
    fetchBookmarks(user.uid, skip, limit, filter, last);

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
