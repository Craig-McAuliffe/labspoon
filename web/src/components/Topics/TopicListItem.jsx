import React from 'react';
import {Link} from 'react-router-dom';

import './TopicListItem.css';

export default function TopicListItem({
  topic,
  dedicatedPage,
  microsoftTopic,
  children,
}) {
  if (!topic) {
    return <></>;
  }
  return (
    <div className="topic-list-item-container">
      {dedicatedPage || microsoftTopic ? (
        <h2>{topic.name}</h2>
      ) : (
        <Link to={`/topic/${topic.id}`}>
          <h3>{topic.name}</h3>
        </Link>
      )}
      {children}
    </div>
  );
}
