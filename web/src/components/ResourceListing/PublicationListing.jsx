import React from 'react';

import {
  LectureIcon,
  ProjectIcon,
  OpenPositionIcon,
  PublicationIcon,
} from '../../assets/PostTypeIcons';

import PostActions from '../Posts/Post/PostParts/PostActions';

import UserAvatar from '../Avatar/UserAvatar';

const PublicationListing = ({post}) => {
  return (
    <div className="text-post">
      <PostHeader post={post} />
      <PostTextContent post={post} />
      <PostTopics post={post} />
      <PostActions />
    </div>
  );
};

function PostHeader({post}) {
  const postTypeIcons = () => {
    switch (post.type.name) {
      case 'publication':
        return <PublicationIcon />;
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
      </div>
      <div className="post-type-container">
        <div className="post-type-icon">{postTypeIcons()}</div>
        {postTypeName()}
      </div>
    </div>
  );
}

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

function PostTextContent({post}) {
  return (
    <div className="post-text-content">
      <h2>{post.title}</h2>
      <p>{post.content.abstract}</p>
    </div>
  );
}

export default PublicationListing;
