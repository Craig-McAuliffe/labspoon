import React, {useContext} from 'react';

import {db} from '../../firebase';
import {FeatureFlags} from '../../App';
import {AuthContext} from '../../App';

import FilterableResults from '../../components/FilterableResults/FilterableResults';

import getFilteredTestPosts from '../../mockdata/posts';
import {getPostFilters} from '../../mockdata/filters';

const filterOptionsData = getPostFilters(getFilteredTestPosts([]));

/**
 * Fetches a user's feed data applying pagination and a filter
 * @param {String} uuid - user's unique ID
 * @param {number} skip - number of results to skip
 * @param {number} limit - number of results to return
 * @param {Array} filter - filter to apply to results, see FeedPage
 * documentation
 * @return {Array}
 */
function fetchUserFeedData(uuid, skip, limit, filter) {
  // TODO(patrick): update to use user's feed data
  return fetchPublicFeedData(skip, limit, filter);
}

/**
 * Fetches the public feed data that will be shown when no user is signed in
 * @param {number} skip - number of results to skip
 * @param {number} limit - number of results to return
 * @param {Array} filter - filter to apply to results, see FeedPage
 * documentation
 * @return {Array}
 */
function fetchPublicFeedData(skip, limit, filter) {
  return db
    .collection('posts')
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

/**
 * Fetches test data applying pagination and a filter
 * @param {number} skip - number of results to skip
 * @param {number} limit - number of results to return
 * @param {Array} filter - filter to apply to results, see FeedPage
 * documentation
 * @return {Array}
 */
function fetchTestFeedData(skip, limit, filter) {
  const repeatedTestPosts = getFilteredTestPosts(filter);
  return repeatedTestPosts.slice(skip, skip + limit);
}

/**
 * Renders the feed page, which contains both a feed and a filter menu
 * @return {React.ReactElement}
 */
export default function FollowingFeedPage() {
  const featureFlags = useContext(FeatureFlags);
  const user = useContext(AuthContext);

  let fetchResults;
  if (featureFlags.has('cloud-firestore')) {
    if (user) {
      fetchResults = (skip, limit, filter) =>
        fetchUserFeedData(user.uid, skip, limit, filter);
    } else {
      fetchResults = fetchPublicFeedData;
    }
  } else {
    fetchResults = fetchTestFeedData;
  }

  return (
    <FilterableResults
      fetchResults={fetchResults}
      defaultFilter={filterOptionsData}
      limit={10}
      useTabs={false}
    />
  );
}
