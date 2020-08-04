import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../Post/Post';

/**
 * Displays an infinitely scrolling list of posts.
 * @param {Array} results - results to render
 * @param {Boolean} hasMore - whether there are more results that can be loaded
 * @param {Function} fetchMore - when called returns the next page of results
 * @return {React.ReactElement}
*/
export default function PostList({results, hasMore, fetchMore}) {
  console.log('results', results);
  const posts = results.map(
      (result) => <Post key={result.id} post={result}/>,
  );
  return (
    <InfiniteScroll
      dataLength={posts.length}
      hasMore={hasMore}
      next={fetchMore}
      loader={<p>Loading...</p>}
      endMessage={<p>No more results</p>}
    >
      {posts}
    </InfiniteScroll>
  );
}
PostList.propTypes = {
  results: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  fetchMore: PropTypes.func.isRequired,
};
