import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../Post/Post';
import PublicationListing from '../../ResourceListing/PublicationListing';
import './PostList.css';

/**
 * Displays an infinitely scrolling list of posts.
 * @param {Array} results - results to render
 * @param {Boolean} hasMore - whether there are more results that can be loaded
 * @param {Function} fetchMore - when called returns the next page of results
 * @return {React.ReactElement}
 */
export default function PostList({results, hasMore, fetchMore}) {
  return (
    <div className="feed-container">
      <div className="feed-items">
        <InfiniteScroll
          dataLength={results.length}
          hasMore={hasMore}
          next={fetchMore}
          loader={<p>Loading...</p>}
          endMessage={<p>No more results</p>}
          style={{minWidth: '100%'}}
        >
          <PostOrResource results={results} />
        </InfiniteScroll>
      </div>
    </div>
  );
}
PostList.propTypes = {
  results: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  fetchMore: PropTypes.func.isRequired,
};

const PostOrResource = ({results}) => {
  const Posts = results.map((result) => {
    if (result.category === 'resource')
      return <PublicationListing post={result} key={result.id} />;
    else return <Post post={result} key={result.id} />;
  });
  return Posts;
};
