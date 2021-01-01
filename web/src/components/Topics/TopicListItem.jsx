import React from 'react';
import {Link} from 'react-router-dom';

import './TopicListItem.css';

export default function TopicListItem({
  topic,
  dedicatedPage,
  children,
  noLink,
  LinkOverride = undefined,
}) {
  if (!topic) {
    return null;
  }
  const displayType = () => {
    if (dedicatedPage) return <h2>{topic.name}</h2>;
    if (noLink) return <h3>{topic.name}</h3>;
    if (LinkOverride)
      return (
        <LinkOverride>
          <h3>{topic.name}</h3>
        </LinkOverride>
      );
    else
      return (
        <Link to={`/topic/${topic.id}`}>
          <h3>{topic.name}</h3>
        </Link>
      );
  };
  return (
    <div className="topic-list-item-container">
      {displayType()}
      {children}
    </div>
  );
}
