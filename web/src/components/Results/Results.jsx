import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Post from '../Posts/Post/Post';
import BookmarkListItem from '../Bookmarks/BookmarkListItem/BookmarkListItem';

import './Results.css';

/**
 * Displays an infinitely scrolling list of posts.
 * @param {Array} results - results to render
 * @param {Boolean} hasMore - whether there are more results that can be loaded
 * @param {Function} fetchMore - when called returns the next page of results
 * @return {React.ReactElement}
 */
export default function Results({results, hasMore, fetchMore}) {
  const items = results.map((result) => <ListItem result={result}/>);
  return (
    <InfiniteScroll
      dataLength={items.length}
      hasMore={hasMore}
      next={fetchMore}
      loader={<p>Loading...</p>}
      endMessage={<p>No more results</p>}
      style={{'min-width': '100%'}}
    >
      {items}
    </InfiniteScroll>
  );
}
Results.propTypes = {
  results: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  fetchMore: PropTypes.func.isRequired,
};

export function ListItem({result}) {
  switch (result.type) {
    case 'post':
      return <Post key={result.id} post={result} />;
    case 'bookmark':
      return <BookmarkListItem key={result.id} bookmark={result} />;
    default:
      return <></>;
  }
}
