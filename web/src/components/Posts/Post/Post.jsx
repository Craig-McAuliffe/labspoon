import React from 'react';
import {Link} from 'react-router-dom';
import Linkify from 'linkifyjs/react';
import PropTypes from 'prop-types';
import PostOptionalTags from './PostParts/PostOptionalTags';
import PostActions, {BookmarkedPostSymbol} from './PostParts/PostActions';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import ListItemTopics from '../../CommonListItemParts/ListItemTopics';
import PublicationListItem from '../../Publication/PublicationListItem';
import UserAvatar from '../../Avatar/UserAvatar';

import 'bootstrap/dist/css/bootstrap.min.css';

import './Post.css';
/**
 * Generic entry point for display any type of post within a feed or search
 * result
 * @return {React.ReactElement}
 */
export default function Post({post, dedicatedPage, bookmarkedVariation}) {
  if (post.generated)
    return (
      <div className="post-referenced-resource-container">
        <PublicationListItem
          publication={post.referencedResource}
          removeBorder={true}
        />
        <div className="post-container">
          <PostHeader
            postAuthor={post.author}
            postCreationDate={post.createdAt}
          />
          <PostTextContent post={post} />
        </div>
      </div>
    );

  return (
    <div
      className={
        dedicatedPage ? 'post-container-dedicated-page' : 'post-container'
      }
    >
      {bookmarkedVariation ? <BookmarkedPostSymbol post={post} /> : null}
      <PostHeader
        postAuthor={post.author}
        postCreationDate={post.createdAt}
        dedicatedPage={dedicatedPage}
      />
      <PostTextContent post={post} dedicatedPage={dedicatedPage} />
      <PostOptionalTags optionalTags={post.optionaltags} />
      <ListItemTopics dbTopics={post.topics} customTopics={post.customTopics} />
      {bookmarkedVariation ? null : (
        <PostActions post={post} dedicatedPage={dedicatedPage} />
      )}
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
    content: PropTypes.object.isRequired,
    optionaltags: PropTypes.arrayOf(PropTypes.object.isRequired),
  }).isRequired,
};

/**
 * Display the header on a post
 * @return {React.ReactElement}
 */
function PostHeader({postAuthor, postCreationDate, dedicatedPage}) {
  return (
    <div
      className={dedicatedPage ? 'post-header-dedicated-page' : 'post-header'}
    >
      <div className="post-header-profile">
        <div className="post-header-avatar">
          {postAuthor.avatar ? (
            <UserAvatar src={postAuthor.avatar} width="60px" height="60px" />
          ) : (
            <img src={DefaultUserIcon} alt="user icon" />
          )}
        </div>
        <div>
          <h3>
            <Link to={`/user/${postAuthor.id}`}>{postAuthor.name}</Link>
          </h3>
          <p>{postCreationDate}</p>
        </div>
      </div>
      <div className="post-type-container"></div>
    </div>
  );
}

/**
 * Display content for a post text
 * @return {React.ReactElement}
 */
function PostTextContent({post, dedicatedPage}) {
  if (dedicatedPage)
    return (
      <div className="post-text-content">
        <Linkify tagName="p">{post.content.text}</Linkify>
      </div>
    );

  return (
    <div className="post-text-content">
      <Link to={`/post/${post.id}`}>
        <Linkify tagName="p">{post.content.text}</Linkify>
      </Link>
    </div>
  );
}

export function PinnedPost({post}) {
  if (post === undefined) return <></>;
  return (
    <div className="pinned-post">
      <h3>{post.title}</h3>
      <div>
        {post.topics
          .map((postTopic) => (
            <h4 key={postTopic.id} className="pinned-post-topic">
              {postTopic.name}
            </h4>
          ))
          .slice(0, 3)}
      </div>
      <p className="pinned-post-more-info">Click for more info</p>
    </div>
  );
}
