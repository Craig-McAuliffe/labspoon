import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Post from '../Posts/Post/Post';
import BookmarkListItem from '../Bookmarks/BookmarkListItem/BookmarkListItem';
import PublicationListItem from '../Publication/PublicationListItem';
import UserListItem from '../User/UserListItem';

import './Results.css';

/**
 * Displays an infinitely scrolling list of posts.
 * @param {Array} results - results to render
 * @param {Boolean} hasMore - whether there are more results that can be loaded
 * @param {Function} fetchMore - when called returns the next page of results
 * @return {React.ReactElement}
 */
export default function Results({results, hasMore, fetchMore}) {
  const items = results.map((result, i) => (
    <GenericListItem key={result.id + i} result={result} />
  ));
  return (
    <div className="page-content-container">
      <InfiniteScroll
        dataLength={items.length}
        hasMore={hasMore}
        next={fetchMore}
        loader={<p>Loading...</p>}
        endMessage={<p>No more results</p>}
        style={{minWidth: '100%'}}
      >
        {items}
      </InfiniteScroll>
    </div>
  );
}
Results.propTypes = {
  results: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  fetchMore: PropTypes.func.isRequired,
};

export function GenericListItem({result}) {
  switch (result.resourceType) {
    case 'post':
      return <Post post={result} key={result.id + 'post'} />;
    case 'bookmark':
      return (
        <BookmarkListItem bookmark={result} key={result.id + 'bookmark'} />
      );
    case 'publication':
      return (
        <PublicationListItem
          publication={result}
          key={result.id + 'publication'}
        />
      );
    case 'user':
      return <UserListItem user={result} key={result.id + 'user'} />;
    default:
      return null;
  }
}
