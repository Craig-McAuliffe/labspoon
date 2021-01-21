import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext} from '../../App';
import {getEnabledIDsFromFilter} from '../../helpers/filters';
import FilterableResults, {
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import {translateOptionalFields} from '../../helpers/posts';
import {LoadingSpinnerPage} from '../../components/LoadingSpinner/LoadingSpinner';

const arrayContainsAnyErrorMessage =
  'Cannot select multiple of more than one resource type. Try deselecting the last option.';

// Due to the limitations in firestore filters described in
// https://firebase.google.com/docs/firestore/query-data/queries it is not
// possible to use multiple many-to-many filters (ie. `array-contains-any` and
// `in`).
function fetchUserFeedData(uuid, skip, limit, filter, last) {
  const collection = db
    .collection(`users/${uuid}/feeds/followingFeed/posts`)
    .orderBy('timestamp', 'desc');
  return filterFeedData(collection, skip, limit, filter, last);
}

function filterFeedData(collection, skip, limit, filter, last) {
  const enabledIDs = getEnabledIDsFromFilter(filter);
  if (enabledIDs.size !== 0) {
    // No more than one array-contains-any condition may be used in a single compound query.
    let arrayContainsAnyCount = 0;
    const enabledAuthorIDs = enabledIDs.get('Author');
    const enabledPostTypeIDs = enabledIDs.get('Post Type');

    if (enabledPostTypeIDs.length === 1) {
      collection = collection.where('postType.id', '==', enabledPostTypeIDs[0]);
    }
    if (enabledPostTypeIDs.length > 1) {
      arrayContainsAnyCount++;
      collection = collection.where('postType.id', 'in', enabledPostTypeIDs);
    }

    if (enabledAuthorIDs.length === 1) {
      collection = collection.where('author.id', '==', enabledAuthorIDs[0]);
    }
    if (enabledAuthorIDs.length > 1) {
      arrayContainsAnyCount++;
      if (arrayContainsAnyCount > 1)
        return [undefined, arrayContainsAnyErrorMessage];
      collection = collection.where('author.id', 'in', enabledAuthorIDs);
    }

    const enabledTopicIDs = enabledIDs.get('Topics');
    if (enabledTopicIDs !== undefined) {
      if (enabledTopicIDs.length === 1) {
        collection = collection.where(
          'filterTopicIDs',
          'array-contains',
          enabledTopicIDs[0]
        );
      }
      if (enabledTopicIDs.length > 1) {
        arrayContainsAnyCount++;
        if (arrayContainsAnyCount > 1)
          return [undefined, arrayContainsAnyErrorMessage];
        collection = collection.where(
          'filterTopicIDs',
          'array-contains-any',
          enabledTopicIDs
        );
      }
    }
  }

  const sortedAndPaginatedResults = sortAndPaginateFeedData(
    collection,
    last,
    limit
  );
  return [sortedAndPaginatedResults.then(translateOptionalFields), undefined];
}

function sortAndPaginateFeedData(results, last, limit) {
  if (typeof last !== 'undefined') {
    results = results.startAt(last.timestamp);
  }
  return results
    .limit(limit)
    .get()
    .then((qs) => {
      const posts = [];
      qs.forEach((doc) => {
        const post = doc.data();
        post.id = doc.id;
        post.resourceType = 'post';
        posts.push(post);
      });
      return posts;
    })
    .catch((err) => console.log(err));
}

function getFiltersFromFilterCollection(filterCollection) {
  const filterCollections = [];
  filterCollection.forEach((filterCollectionDoc) => {
    const filterCollectionData = filterCollectionDoc.data();
    const filterOptionsPromise = filterCollectionDoc.ref
      .collection('filterOptions')
      .orderBy('rank')
      .get()
      .then((qs) => {
        const filterCollection = {
          collectionName: filterCollectionData.resourceName,
          options: [],
          mutable: true,
        };
        qs.forEach((doc) => {
          const filterOptionData = doc.data();
          filterCollection.options.push({
            data: {
              id: filterOptionData.id,
              name: filterOptionData.name,
            },
            enabled: false,
          });
        });
        return filterCollection;
      })
      .catch((err) => console.log('filter err', err));
    filterCollections.push(filterOptionsPromise);
  });
  return Promise.all(filterCollections);
}

function fetchUserFeedFilters(uuid) {
  const results = db
    .collection(`users/${uuid}/feeds/followingFeed/filterCollections`)
    .get()
    .then((fcqs) => getFiltersFromFilterCollection(fcqs))
    .catch((err) => console.log(err));
  return results;
}

export default function FollowingFeedPage() {
  const {user, authLoaded} = useContext(AuthContext);

  const getDefaultFilter = () => {
    if (!user) return [];
    return fetchUserFeedFilters(user.uid);
  };

  const fetchResults = (skip, limit, filter, last) => {
    if (!user) return [];
    return fetchUserFeedData(user.uid, skip, limit, filter, last);
  };

  if (authLoaded === false) return <LoadingSpinnerPage />;
  return (
    <FilterableResults fetchResults={fetchResults} limit={10} loadingFilter>
      <FilterManager>
        <NewFilterMenuWrapper getDefaultFilter={getDefaultFilter} />
        <ResourceTabs />
      </FilterManager>
      <div className="content-layout">
        <div className="feed-container">
          <CreatePost />
          <NewResultsWrapper />
        </div>
      </div>
    </FilterableResults>
  );
}
