import React from 'react';

import FilterableResults from '../../components/FilterableResults/FilterableResults';
import PostList from '../../components/Posts/PostList/PostList';
import {
  FilterMenu,
  getFilterCollectionEnabledIDsSet,
} from '../../components/Filter/Filter';
import Sider from '../../components/Layout/Sider/Sider';

import getFilteredTestPosts from '../../mockdata/posts';
import {getPostFilters} from '../../mockdata/filters';

const filterOptionsData = getPostFilters(getFilteredTestPosts([]));

/**
 * Fetches test data applying pagination and a filter
 * This will be replaced by API calls
 * @param {number} skip - number of results to skip
 * @param {number} limit - number of results to return
 * @param {Array} filter - filter to apply to results, see FeedPage
 * documentation
 * @return {Array}
 */
function fetchFeedData(skip, limit, filter) {
  const repeatedTestPosts = getFilteredTestPosts(filter);
  return repeatedTestPosts.slice(skip, skip + limit);
}

/**
 * Renders the feed page, which contains both a feed and a filter menu
 * @return {React.ReactElement}
 */
export default function FollowingFeedPage() {
  return (
    <FilterableResults
      fetchResults={fetchFeedData}
      defaultFilter={filterOptionsData}
      limit={10}
      useTabs={false}
    />
  );
}
