import React from 'react';
import {Link} from 'react-router-dom';

import './TopicListItem.css';

export default function TopicListItem({
  topic,
  dedicatedPage,
  children,
  noLink,
}) {
  if (!topic) {
    return <></>;
  }
  const displayType = () => {
    if (dedicatedPage) return <h2>{topic.name}</h2>;
    if (noLink) return <h3>{topic.name ? topic.name : topic.DFN}</h3>;
    else
      return (
        <Link to={`/topic/${topic.id}`}>
          <h3>{topic.name ? topic.name : topic.DFN}</h3>
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
