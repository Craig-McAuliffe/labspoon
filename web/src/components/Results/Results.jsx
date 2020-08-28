import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import Post from '../Posts/Post/Post';
import BookmarkListItem from '../Bookmarks/BookmarkListItem/BookmarkListItem';
import PublicationListItem from '../Publication/PublicationListItem';
import UserListItem from '../User/UserListItem';
import ImageFeedItem from '../Media/ImageFeedItem';
import GroupFeedItem from '../Group/GroupFeedItem';
import TopicListItem from '../Topics/TopicListItem';

import './Results.css';

/**
 * Displays an infinitely scrolling list of posts.
 * @param {Array} results - results to render
 * @param {Boolean} hasMore - whether there are more results that can be loaded
 * @param {Function} fetchMore - when called returns the next page of results
 * @return {React.ReactElement}
 */
export default function Results({results, hasMore, fetchMore, activeTabID}) {
  const items = results.map((result, i) => (
    <GenericListItem key={result.id + i} result={result} />
  ));

  const resultTypes = [];
  results.forEach((result) => {
    if (resultTypes.some((resultType) => resultType === result.resourceType))
      return;
    resultTypes.push(result.resourceType);
  });

  return (
    <div className="page-content-container">
      {resultTypes.length > 1 ? (
        <MixedResultsPage results={results} />
      ) : (
        <InfiniteScroll
          dataLength={items.length}
          hasMore={hasMore}
          next={fetchMore}
          loader={<p>Loading...</p>}
          endMessage={<p>No more results</p>}
          style={{minWidth: '100%'}}
        >
          {activeTabID === 'media' ? (
            <div className="feed-images-container">{items}</div>
          ) : (
            items
          )}
        </InfiniteScroll>
      )}
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
    case 'group':
      return <GroupFeedItem key={result.id + 'group'} group={result} />;
    case 'topic':
      return <TopicListItem key={result.id + 'topic'} topic={result} />;
    case 'image':
      return (
        <ImageFeedItem
          src={result.src}
          alt={result.alt}
          key={result.id + 'image'}
        />
      );
    default:
      return null;
  }
}

function MixedResultsPage({results}) {
  const publicationResults = results.filter(
    (result) => result.resourceType === 'publication'
  );
  const userResults = results.filter(
    (result) => result.resourceType === 'user'
  );
  const imageResults = results.filter(
    (result) => result.resourceType === 'image'
  );
  const postResults = results.filter(
    (result) => result.resourceType === 'post'
  );

  return (
    <div>
      {imageResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3>Images</h3>
          <div className="feed-images-container">
            {imageResults.map((image) => (
              <ImageFeedItem
                key={image.id + 'image'}
                src={image.src}
                alt={image.alt}
              />
            ))}
          </div>
        </div>
      ) : null}
      {publicationResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3>Publications</h3>
          {publicationResults.map((publication) => (
            <PublicationListItem
              key={publication.id + 'publication'}
              publication={publication}
              mixedResults={true}
            />
          ))}
        </div>
      ) : null}
      {userResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3>Researchers</h3>
          {userResults.map((user) => (
            <UserListItem key={user.id + 'user'} user={user} />
          ))}
        </div>
      ) : null}
      {postResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3>Posts</h3>
          {postResults.map((post) => (
            <Post key={post.id + 'post'} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
