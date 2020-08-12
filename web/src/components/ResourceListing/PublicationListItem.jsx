import React from 'react';
import {Link} from 'react-router-dom';

import {
  LectureIcon,
  ProjectIcon,
  OpenPositionIcon,
  PublicationIcon,
} from '../../assets/PostTypeIcons';

import PostActions from '../Posts/Post/PostParts/PostActions';

import FeedItemTopics from '../FeedItems/FeedItemTopics';

import './PublicationListItem.css';

const PublicationListItem = ({post}) => {
  return (
    <div className="resource-post">
      <ResourceHeader post={post} />
      <ResourceTextContent post={post} />
      <FeedItemTopics taggedItem={post} />
      <PostActions />
    </div>
  );
};

function ResourceHeader({post}) {
  const postTypeIcons = () => {
    switch (post.type.name) {
      case 'publication':
        return <PublicationIcon />;
      default:
        return null;
    }
  };

  const resourceTypeName = () => {
    if (post.type.name === 'default') return null;
    return <h2 className="resource-type-name">{post.type.name}</h2>;
  };

  return (
    <div className="resource-header">
      <div className="resource-header-logo">
        <img src={post.author.avatar} alt="Labspoon Logo" />
      </div>
      <div className="resource-type-container">
        <div className="resource-type-icon">{postTypeIcons()}</div>
        {resourceTypeName()}
      </div>
    </div>
  );
}

function ResourceTextContent({post}) {
  return (
    <div className="resource-text-content">
      <Link to={`/publication/${post.id}`}>
        <h3>{post.title}</h3>
      </Link>
      <div className="resource-content-authors">
        {post.content.authors.map((author) => (
          <Link
            to={`/profile/${author.id}`}
            className="resource-content-author"
          >
            {author.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PublicationListItem;
