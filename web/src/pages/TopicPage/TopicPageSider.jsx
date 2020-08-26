import React from 'react';
import {Link} from 'react-router-dom';
import topics from '../../mockdata/topics';
import './TopicPage.css';

export default function TopicPageSider({currentTopic}) {
  const search = false;

  const similarTopics = () => {
    return topics()
      .slice(0, 10)
      .map((topic) => (
        <div className="suggested-topic" key={topic.id}>
          <Link to={`/topic/${topic.id}`}>{topic.name}</Link>
        </div>
      ));
  };

  return search ? <div></div> : similarTopics();
}
