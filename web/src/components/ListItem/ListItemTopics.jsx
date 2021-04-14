import React from 'react';

import {Link} from 'react-router-dom';
import {DARK_NAME_SHADE} from '../../pages/ResourcePages/GroupPage/EditGroupDisplay';
import './ListItemTopics.css';

export default function ListItemTopics({
  dbTopics,
  customTopics,
  backgroundShade,
}) {
  if (!dbTopics && !customTopics) return null;
  if (!dbTopics) dbTopics = [];
  if (!customTopics) customTopics = [];
  if (dbTopics.length === 0 && customTopics.length === 0) return null;

  const topicLinks = (topics) => {
    if (!topics) return null;
    return topics.map((topic) => {
      if (!topic.id && !topic.microsoftID)
        return (
          <p
            className={`tagged-topic-names${
              backgroundShade === DARK_NAME_SHADE ? '-dark' : '-light'
            }`}
            key={topic.name}
          >
            {topic.name}
          </p>
        );

      const topicID = topic.id ? topic.id : topic.microsoftID;
      return (
        <Link
          to={topic.id ? `/topic/${topicID}` : `/magField/${topicID}`}
          key={topicID}
          className={`tagged-topic-names${
            backgroundShade === DARK_NAME_SHADE ? '-dark' : '-light'
          }`}
        >
          {topic.name}
        </Link>
      );
    });
  };

  return (
    <div className="post-topics-container">
      <p
        className={`topics-sub-title${
          backgroundShade === DARK_NAME_SHADE ? '-dark' : '-light'
        }`}
      >
        Topics:{' '}
      </p>
      {topicLinks(dbTopics)}
      {topicLinks(customTopics)}
    </div>
  );
}
