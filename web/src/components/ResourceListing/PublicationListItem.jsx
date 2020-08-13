import React from 'react';
import {Link} from 'react-router-dom';

import {PublicationIcon} from '../../assets/PostTypeIcons';

import PostActions from '../Posts/Post/PostParts/PostActions';

import FeedItemTopics from '../FeedItems/FeedItemTopics';

import './PublicationListItem.css';

const PublicationListItem = ({post}) => {
  return (
    <div className="resource-post">
      <ResourceHeader
        resourceType={post.resourceType}
        postAuthor={post.author}
      />
      <ResourceTextContent publication={post.resource} />
      <FeedItemTopics taggedItem={post.resource} />
      <PostActions />
    </div>
  );
};

// If other resourceType posts use this design component, then we will swith here
function ResourceHeader({resourceType, postAuthor}) {
  const postTypeIcons = () => {
    switch (resourceType) {
      case 'publication':
        return <PublicationIcon />;
      default:
        console.log('Error: needs resourceType');
        return null;
    }
  };

  const resourceTypeName = () =>
    resourceType ? (
      <h2 className="resource-type-name">{resourceType}</h2>
    ) : null;

  return (
    <div className="resource-header">
      <div className="resource-header-logo">
        <img src={postAuthor.avatar} alt="Labspoon Logo" />
      </div>
      <div className="resource-type-container">
        <div className="resource-type-icon">{postTypeIcons()}</div>
        {resourceTypeName()}
      </div>
    </div>
  );
}

function ResourceTextContent({publication}) {
  return (
    <div className="resource-text-content">
      <Link to={`/publication/${publication.id}`}>
        <h3>{publication.title}</h3>
      </Link>
      <div className="resource-content-authors">
        {publication.content.authors.map((author) => (
          <Link
            to={`/profile/${author.id}`}
            className="resource-content-author"
            key={author.id}
          >
            {author.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PublicationListItem;
