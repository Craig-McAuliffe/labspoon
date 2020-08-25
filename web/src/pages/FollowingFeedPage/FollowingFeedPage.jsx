import React, {useContext} from 'react';

import {db} from '../../firebase';
import {AuthContext, FeatureFlags} from '../../App';

import FilterableResults from '../../components/FilterableResults/FilterableResults';

import getFilteredTestPosts from '../../mockdata/posts';
import {getPostFilters} from '../../mockdata/filters';

function fetchUserFeedData(uuid, skip, limit, filter, last) {
  const results = db
    .collection(`users/${uuid}/feeds/followingFeed/posts`)
    .orderBy('timestamp');
  return sortAndPaginateFeedData(results, last, limit);
}

function fetchPublicFeedData(skip, limit, filter, last) {
  const results = db.collection('posts').orderBy('timestamp');
  return sortAndPaginateFeedData(results, last, limit);
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

function fetchUserFeedFilters(uuid) {
  const results = db
    .collection(`users/${uuid}/feeds/followingFeed/filterCollections`)
    .get()
    .then((fcqs) => {
      const filterCollections = [];
      fcqs.forEach((filterCollectionDoc) => {
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
    })
    .catch((err) => console.log(err));
  return results;
}

function fetchPublicFeedFilters() {
  return [];
}

export default function FollowingFeedPage() {
  const featureFlags = useContext(FeatureFlags);
  const user = useContext(AuthContext);

  let fetchResults;
  let getDefaultFilter;
  if (featureFlags.has('cloud-firestore')) {
    if (user) {
      fetchResults = (skip, limit, filter, last) =>
        fetchUserFeedData(user.uid, skip, limit, filter, last);
      getDefaultFilter = () => fetchUserFeedFilters(user.uid);
    } else {
      fetchResults = fetchPublicFeedData;
      getDefaultFilter = fetchPublicFeedFilters;
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
    />
  );
}
