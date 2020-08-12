import React from 'react';
import {Link} from 'react-router-dom';

import {
  LectureIcon,
  ProjectIcon,
  OpenPositionIcon,
  PublicationIcon,
} from '../../assets/PostTypeIcons';

import PostActions from '../Posts/Post/PostParts/PostActions';

import './PublicationListing.css';

const PublicationListing = ({post}) => {
  return (
    <div className="resource-post">
      <ResourceHeader post={post} />
      <ResourceTextContent post={post} />
      <ResourceTopics post={post} />
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

function ResourceTopics({post}) {
  return (
    <div className="resource-topics">
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

function ResourceTextContent({post}) {
  return (
    <div className="resource-text-content">
      <Link to={`/publication/${post.id}`}>
        <h3>{post.title}</h3>
      </Link>
      <div className="resource-content-authors">
        {post.content.authors.map((author) => (
          <Link to="/profile" className="resource-content-author">
            {author}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PublicationListing;
