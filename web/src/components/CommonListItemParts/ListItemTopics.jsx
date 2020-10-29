import React from 'react';

import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import './ListItemTopics.css';

export default function ListItemTopics({taggedItem}) {
  if (!taggedItem.topics) return <></>;
  const topicLinks = taggedItem.topics.map((topic) => {
    let link;
    if (topic.id) {
      link = `/topic/${topic.id}`;
    } else {
      link = `/magField/${topic.microsoftID}`;
    }
    return (
      <Link to={link} key={topic.id} className="topic-names">
        {topic.name}
      </Link>
    );
  });
  if (!taggedItem.topics || taggedItem.topics.length === 0) return <></>;
  return (
    <div className="post-topics">
      <p className="topics-sub-title">Topics: </p>
      <div className="topic-names-container">{topicLinks}</div>
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
