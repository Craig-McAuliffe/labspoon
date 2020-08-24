import React from 'react';
import {Link} from 'react-router-dom';

import {
  LectureIcon,
  ProjectIcon,
  FundingIcon,
  OpenPositionIcon,
  NewsIcon,
  MemberChangeIcon,
  PublicationIcon,
} from '../../../assets/PostTypeIcons';

import PostOptionalTags from './PostParts/PostOptionalTags';
import PostActions from './PostParts/PostActions';
import FeedItemTopics from '../../FeedItems/FeedItemTopics';
import PropTypes from 'prop-types';

import './Post.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserAvatar from '../../Avatar/UserAvatar';

/**
 * Generic entry point for display any type of post within a feed or search
 * result
 * @return {React.ReactElement}
 */
export default function Post({post}) {
  function GeneratedPostContent({publication}) {
    return (
      <>
        <div className="generated-post-content">
          <Link to={`/publication/${publication.id}`}>
            <h3 className="generated-post-title">{publication.title}</h3>
          </Link>
          <div className="generated-post-content-authors">
            {publication.content.authors.map((author) => (
              <h4 key={author.id}>
                <Link
                  to={`/user/${author.id}`}
                  className="generated-post-content-author"
                >
                  {author.name}
                </Link>
              </h4>
            ))}
          </div>
        </div>
      </>
    );
  }

  return post.generated ? (
    <div className="generated-post-container">
      <GeneratedPostHeader postType={post.postType} postAuthor={post.author} />
      <GeneratedPostContent publication={post.resource} />
      <FeedItemTopics taggedItem={post} />
      <PostActions post={post} />
    </div>
  ) : (
    <div className="post-container">
      <PostHeader postType={post.postType} postAuthor={post.author} />
      <PostTextContent post={post} />
      <PostOptionalTags optionalTags={post.optionaltags} />
      <FeedItemTopics taggedItem={post} />
      <PostActions post={post} />
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.object.isRequired,
    author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
    content: PropTypes.object.isRequired,
    topics: PropTypes.arrayOf(
      PropTypes.exact({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
    optionaltags: PropTypes.arrayOf(PropTypes.object.isRequired),
  }).isRequired,
};

/**
 * Display the header on a post
 * @return {React.ReactElement}
 */
function PostHeader({postType, postAuthor}) {
  const postTypeName = () => {
    if (postType.name === 'default') return null;
    return <h2 className="post-type-name">{postType.name}</h2>;
  };

  return (
    <div className="post-header">
      <div className="post-header-profile">
        <div className="post-header-avatar">
          <UserAvatar src={postAuthor.avatar} width="80px" height="80px" />
        </div>
        <h2>
          <Link to={`/user/${postAuthor.id}`}>{postAuthor.name}</Link>
        </h2>
      </div>

      <div className="post-type-container">
        <div className="post-type-icon">{postTypeIcons(postType.name)}</div>
        {postTypeName()}
      </div>
    </div>
  );
}
PostHeader.propTypes = {
  type: PropTypes.string.isRequired,
  author: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Display content for a post text
 * @return {React.ReactElement}
 */
function PostTextContent({post}) {
  return (
    <div className="post-text-content">
      <h3>{post.title}</h3>
      <p>{post.content.text}</p>
    </div>
  );
}
PostTextContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};

function GeneratedPostHeader({postType, postAuthor}) {
  const postTypeName = () =>
    postType.name ? (
      <h2 className="generated-post-type-name">{postType.name}</h2>
    ) : null;

  return (
    <div className="generated-post-header">
      <div>
        <img
          className="generated-post-header-logo"
          src={postAuthor.avatar}
          alt="Labspoon Logo"
        />
      </div>
      <div className="generated-post-type-container">
        <div>{postTypeIcons(postType.name)}</div>
        {postTypeName()}
      </div>
    </div>
  );
}

function postTypeIcons(postTypeName) {
  switch (postTypeName) {
    case 'default':
      return null;
    case 'publication':
      return <PublicationIcon />;
    case 'news':
      return <NewsIcon />;
    case 'open position':
      return <OpenPositionIcon />;
    case 'project':
      return <ProjectIcon />;
    case 'funding':
      return <FundingIcon />;
    case 'lecture':
      return <LectureIcon />;
    case 'member change':
      return <MemberChangeIcon />;
    default:
      return null;
  }
}

export function PinnedPost({post}) {
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
