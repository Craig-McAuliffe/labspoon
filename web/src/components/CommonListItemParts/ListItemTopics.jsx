import React from 'react';

import {Link} from 'react-router-dom';
import './ListItemTopics.css';

export default function ListItemTopics({dbTopics, customTopics}) {
  if (!dbTopics && !customTopics) return null;

  const prioritisedTopicID = (topic) => {
    if (topic.id) return topic.id;
    if (topic.FId) return topic.FId;
    if (topic.microsoftID) return topic.microsoftID;
  };
  const topicLinks = (topics) => {
    if (!topics) return null;
    return topics.map((topic) => {
      if (!topic.id && !topic.FId && !topic.microsoftID)
        return (
          <p className="tagged-topic-names" key={topic.name}>
            {topic.name}
          </p>
        );

      const topicID = prioritisedTopicID(topic);
      return (
        <Link
          to={topic.id ? `/topic/${topicID}` : `/magField/${topicID}`}
          key={topicID}
          className="tagged-topic-names"
        >
          {topic.name ? topic.name : topic.DFN}
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
