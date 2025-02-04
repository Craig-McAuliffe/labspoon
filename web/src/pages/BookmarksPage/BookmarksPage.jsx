import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext} from '../../App';

import FilterableResults, {
  NewResultsWrapper,
  NewFilterMenuWrapper,
  ResourceTabs,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';
import {BOOKMARK} from '../../helpers/resourceTypeDefinitions';
import {LoadingSpinnerPage} from '../../components/LoadingSpinner/LoadingSpinner';
import Content, {UnpaddedPageContainer} from '../../components/Layout/Content';

function fetchBookmarks(uuid, skip, limit, filter, last) {
  let results = db
    .collection(`users/${uuid}/bookmarks`)
    .orderBy('timestamp', 'desc');
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
          bookmark.resourceType = BOOKMARK;
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

  if (!user) return <LoadingSpinnerPage />;
  const fetchResults = (skip, limit, filter, last) =>
    fetchBookmarks(user.uid, skip, limit, filter, last);

  return (
    <Content>
      <FilterableResults fetchResults={fetchResults} limit={10}>
        <FilterManager>
          <NewFilterMenuWrapper />
          <UnpaddedPageContainer>
            <ResourceTabs />
            <NewResultsWrapper />
          </UnpaddedPageContainer>
        </FilterManager>
      </FilterableResults>
    </Content>
  );
};

export default BookmarksPage;
