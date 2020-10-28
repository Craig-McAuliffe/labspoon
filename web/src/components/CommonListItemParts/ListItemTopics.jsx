import React from 'react';

import {Link} from 'react-router-dom';
import './ListItemTopics.css';

export default function ListItemTopics({taggedItem}) {
  if (!taggedItem.topics && !taggedItem.customTopics) return null;

  const topicLinks = (topics) => {
    if (!topics) return null;
    return topics.map((topic) =>
      topic.id ? (
        <Link
          to={`/topic/${topic.id}`}
          key={topic.id}
          className="tagged-topic-names"
        >
          {topic.name}
        </Link>
      ) : (
        <p className="tagged-topic-names" key={topic.name}>
          {topic}
        </p>
      )
    );
  };

  return (
    <div className="post-topics">
      <p className="topics-sub-title">Topics: </p>
      <div className="topic-names-container">
        {topicLinks(taggedItem.topics)}
        {topicLinks(taggedItem.customTopics)}
      </div>
    </div>
  );
}
