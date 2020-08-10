import React from 'react';

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
  return (
    <div className="text-post">
      <PostHeader post={post} />
      <PostTextContent post={post} />
      <PostOptionalTags optionalTags={post.optionaltags} />
      <PostTopics post={post} />
      <PostActions />
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
function PostHeader({post}) {
  const postTypeIcons = () => {
    switch (post.type.name) {
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
  };

  const postTypeName = () => {
    if (post.type.name === 'default') return null;
    return <h2 className="post-type-name">{post.type.name}</h2>;
  };

  return (
    <div className="post-header">
      <div className="post-header-profile">
        <UserAvatar
          className="post-header-avatar"
          src={post.author.avatar}
          width="80px"
        />
        <h2>{post.author.name}</h2>
      </div>

      <div className="post-type-container">
        <div className="post-type-icon">{postTypeIcons()}</div>
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

/** Display the topics with which a post has been tagged
 * @return {React.ReactElement}
 */
function PostTopics({post}) {
  return (
    <div className="post-topics">
      <p className="topics-sub-title">Topics: </p>
      <div className="topic-names-container">
        {post.topics.map((topic) => (
          <a key={topic.id} href="/" className="topic-names">
            {topic.name}{' '}
          </a>
        ))}
      </div>
    </div>
  );
}
PostTopics.propTypes = {
  topics: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Display content for a post text
 * @return {React.ReactElement}
 */
function PostTextContent({post}) {
  return (
    <div className="post-text-content">
      <h2>{post.title}</h2>
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
