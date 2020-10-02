import React from 'react';
import {Link} from 'react-router-dom';

import FollowTopicButton from './FollowTopicButton';

import './TopicListItem.css';

export default function TopicListItem({topic, dedicatedPage, children}) {
  if (!topic) {
    return <></>;
  }
  return (
    <div className="topic-list-item-container">
      {dedicatedPage ? (
        <h2>{topic.name}</h2>
      ) : (
        <Link to={`/topic/${topic.id}`}>
          <h3>{topic.name}</h3>
        </Link>
      )}
      <FollowTopicButton targetTopic={topic} />
      {children}
    </div>
  );
}
