import React from 'react';

import {Link} from 'react-router-dom';
import './ListItemTopics.css';

export default function ListItemTopics({dbTopics, customTopics}) {
  if (!dbTopics && !customTopics) return null;
  if (!dbTopics) dbTopics = [];
  if (!customTopics) customTopics = [];
  if (dbTopics.length === 0 && customTopics.length === 0) return null;

  const topicLinks = (topics) => {
    if (!topics) return null;
    return topics.map((topic) => {
      if (!topic.id && !topic.microsoftID)
        return (
          <p className="tagged-topic-names" key={topic.name}>
            {topic.name}
          </p>
        );

      const topicID = topic.id ? topic.id : topic.microsoftID;
      return (
        <Link
          to={topic.id ? `/topic/${topicID}` : `/magField/${topicID}`}
          key={topicID}
          className="tagged-topic-names"
        >
          {topic.name}
        </Link>
      );
    });
  };

  return (
    <div className="post-topics">
      <p className="topics-sub-title">Topics: </p>
      <div className="topic-names-container">
        {topicLinks(dbTopics)}
        {topicLinks(customTopics)}
      </div>
    </div>
  );
}
