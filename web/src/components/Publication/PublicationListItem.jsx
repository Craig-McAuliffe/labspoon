import React from 'react';
import {Link} from 'react-router-dom';

import PostActions from '../Posts/Post/PostParts/PostActions';

import FeedItemTopics from '../FeedItems/FeedItemTopics';

import './PublicationListItem.css';

// If other resourceType posts use this design component, then we will swith here
export function ResourceTextContent({publication}) {
  return (
    <div className="resource-text-content">
      <Link to={`/publication/${publication.id}`}>
        <h3>{publication.title}</h3>
      </Link>
      <div className="resource-content-authors">
        {publication.content.authors.map((author) => (
          <Link
            to={`/user/${author.id}`}
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

export default function PublicationListItem({publication}) {
  return (
    <div className="resource-post">
      <ResourceTextContent publication={publication} />
      <FeedItemTopics taggedItem={publication} />
      <PostActions />
    </div>
  );
}
