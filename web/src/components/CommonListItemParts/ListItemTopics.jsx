import React from 'react';

import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import './ListItemTopics.css';

export default function ListItemTopics({taggedItem}) {
  return (
    <div className="post-topics">
      <p className="topics-sub-title">Topics: </p>
      <div className="topic-names-container">
        {taggedItem.topics.map((topic) => (
          <Link
            to={`/topic/${topic.id}`}
            key={topic.id}
            className="topic-names"
          >
            {topic.name}{' '}
          </Link>
        ))}
      </div>
    </div>
  );
}
ListItemTopics.propTypes = {
  topics: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};
