import React from 'react';
import {Link} from 'react-router-dom';
import {TOPIC} from '../../helpers/resourceTypeDefinitions';
import {FollowsPageListItemOptions} from '../Popovers/FollowOptionsPopover';

import './TopicListItem.css';

export default function TopicListItem({
  topic,
  dedicatedPage,
  children,
  noLink,
  LinkOverride = undefined,
  nameOnly,
  isSmallVersion,
  noDivider,
  isFollowsPageResults,
}) {
  if (!topic) {
    return null;
  }
  const displayType = () => {
    if (dedicatedPage)
      return (
        <div>
          {' '}
          <h2>{topic.name}</h2>
          <a
            className="topic-list-item-ms-acknowledgement"
            href="https://aka.ms/msracad"
            target="_blank"
            rel="noreferrer"
          >
            Powered by Microsoft Academic
          </a>
        </div>
      );
    if (noLink) {
      if (isSmallVersion) return <h4>{topic.name}</h4>;
      return <h3>{topic.name}</h3>;
    }
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
  if (isFollowsPageResults)
    return (
      <div className="topic-list-item-container-with-follow-options">
        {displayType()}
        <FollowsPageListItemOptions
          resourceType={TOPIC}
          targetResourceData={topic}
          noTopicOptions={true}
        />
        <div className="topic-list-item-action-container">{children}</div>
      </div>
    );
  return (
    <div
      className={`topic-list-item-container${noDivider ? '-no-divider' : ''}`}
    >
      {displayType()}
      {!nameOnly && children}
    </div>
  );
}
