import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext, FeatureFlags} from '../../App';

import FilterableResults from '../../components/FilterableResults/FilterableResults';
import getFilteredTestPosts from '../../mockdata/posts';
import {getPostFilters} from '../../mockdata/filters';

function getEnabledIDsFromFilter(filter) {
  const IDsMap = new Map();
  filter.forEach((filterCollection) => {
    IDsMap.set(
      filterCollection.collectionName,
      filterCollection.options
        .filter((option) => option.enabled)
        .map((option) => option.data.id)
    );
  });
  return IDsMap;
}

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
    const enabledAuthorIDs = enabledIDs.get('Author');
    const enabledPostTypeIDs = enabledIDs.get('Post Type');

    if (enabledPostTypeIDs.length === 1) {
      collection = collection.where(
        'filter_postType_id',
        '==',
        enabledPostTypeIDs[0]
      );
    }
    if (enabledPostTypeIDs.length > 1) {
      collection = collection.where(
        'filter_PostType_id',
        'in',
        enabledAuthorIDs
      );
    }

    if (enabledAuthorIDs.length === 1) {
      collection = collection.where(
        'filter_author_id',
        '==',
        enabledAuthorIDs[0]
      );
    }
    if (enabledAuthorIDs.length > 1) {
      collection = collection.where('filter_author_id', 'in', enabledAuthorIDs);
    }

    const enabledTopicIDs = enabledIDs.get('Topics');
    if (enabledTopicIDs !== undefined) {
      if (enabledTopicIDs.length === 1) {
        collection = collection.where(
          'filter_topic_ids',
          'array-contains',
          enabledTopicIDs[0]
        );
      }
      if (enabledTopicIDs.length > 1) {
        collection = collection.where(
          'filter_topic_ids',
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
  return sortedAndPaginatedResults.then((results) => {
    const mappedResults = results.map((result) => {
      Object.entries(result.content).forEach((value) => {
        let [type, content] = value;
        if (type === 'text') return;
        if (type === 'researchers') type = 'researcher';
        if (
          !result.hasOwnProperty('optionaltags') ||
          result.optionaltags.length === 0
        )
          result.optionaltags = [];
        result.optionaltags.push({
          type: type,
          content: content,
        });
      });
      return result;
    });
    return mappedResults;
  });
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

function fetchTestFeedData(skip, limit, filter) {
  const repeatedTestPosts = getFilteredTestPosts(filter);
  return repeatedTestPosts.slice(skip, skip + limit);
}

function getFiltersFromFilterCollection(filterCollection) {
  const filterCollections = [];
  filterCollection.forEach((filterCollectionDoc) => {
    const filterCollectionData = filterCollectionDoc.data();
    const filterOptionsPromise = filterCollectionDoc.ref
      .collection('filterOptions')
      .orderBy('rank')
      .limit(10)
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
              id: filterOptionData.resourceID,
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
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  let fetchResults;
  let getDefaultFilter;
  if (!featureFlags.has('disable-cloud-firestore')) {
    if (user) {
      fetchResults = (skip, limit, filter, last) =>
        fetchUserFeedData(user.uid, skip, limit, filter, last);
      getDefaultFilter = () => fetchUserFeedFilters(user.uid);
    } else {
      fetchResults = () => [];
      getDefaultFilter = () => [];
    }
  } else {
    fetchResults = fetchTestFeedData;
    getDefaultFilter = () => getPostFilters(getFilteredTestPosts([]));
  }

  return (
    <FilterableResults
      fetchResults={fetchResults}
      getDefaultFilter={getDefaultFilter}
      limit={10}
      useTabs={false}
      useFilterSider={true}
      createPost={true}
      homePageTabs={true}
    />
  );
}
