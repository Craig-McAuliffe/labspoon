import React from 'react';
import {Link} from 'react-router-dom';

import FollowButton from '../Buttons/FollowButton';

import './TopicListItem.css';

export default function TopicListItem({topic, dedicatedPage}) {
  return (
    <div className="topic-list-item-container">
      {dedicatedPage ? (
        <h2>{topic.name}</h2>
      ) : (
        <Link to={`/topic/${topic.id}`}>
          <h3>{topic.name}</h3>
        </Link>
      )}
      <FollowButton />
    </div>
  );
}
