import React, {useReducer, useState} from 'react';

import FilterableResults from '../../components/FilterableResults/FilterableResults';
import PostList from '../../components/Posts/PostList/PostList';
import {
  FilterMenu, getFilterCollectionEnabledIDsSet
} from '../../components/Filter/Filter';
import Sider from '../../components/Layout/Sider/Sider';

import getTestPosts from '../../mockdata/posts';
import getFilterOptions from '../../mockdata/filters';

const filterOptionsData = getFilterOptions(getTestPosts());

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
  let repeatedTestPosts = [];
  for (let i = 0; i < 10; i++) {
    repeatedTestPosts = repeatedTestPosts.concat(getTestPosts(i));
  }
  filter.forEach((filterCollection) => {
    const enabledIDs = getFilterCollectionEnabledIDsSet(filterCollection);
    if (enabledIDs.size === 0) return;
    switch (filterCollection.collectionName) {
      case 'People':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => enabledIDs.has(post.author.id),
        );
        break;
      case 'Topics':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => post.topics.some((topic) => enabledIDs.has(topic.id)),
        );
        break;
      case 'Types':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => enabledIDs.has(post.type.id),
        );
        break;
      default:
        break;
    }
  });
  return repeatedTestPosts.slice(skip, skip + limit);
}

/**
 * Renders the feed page, which contains both a feed and a filter menu
 * @return {React.ReactElement}
 */
export default function FollowingFeedPage() {
  return (
    <FilterableResults
      DisplayComponent={FeedComp}
      fetchResults={fetchFeedData}
      defaultFilter={filterOptionsData}
      limit={5}
    />
  );
}

function FeedComp({results, hasMore, fetchMore, filterOptions, updateFilterOption}) {
  return (
    <>
      <div className="Sider">
        <Sider>
          <FilterMenu
            options={filterOptions}
            updateFilterOption={updateFilterOption}
          />
        </Sider>
      </div>
      <div className="Content">
        <PostList
          results={results}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      </div>
    </>
  );
}
