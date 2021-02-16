import React from 'react';
import {Link} from 'react-router-dom';
import ListItemTopics from '../ListItem/ListItemTopics';
import GroupSignature from '../Group/GroupSignature';
import {
  ExpandableText,
  ListItemContainer,
} from '../ListItem/ListItemCommonComponents';

import './OpenPositionListItem.css';
export default function OpenPositionListItem({openPosition}) {
  const content = openPosition.content;

  if (!openPosition) return null;
  return (
    <ListItemContainer>
      <Link to={`/openPosition/${openPosition.id}`}>
        <h3>{content.title}</h3>
      </Link>
      {content.salary.length > 0 ? (
        <h4 className="resource-list-item-inline-subtitle">
          Salary
          <span>{content.salary}</span>
        </h4>
      ) : null}
      {content.startDate.length > 0 ? (
        <h4 className="resource-list-item-inline-subtitle">
          Start date
          <span>{content.startDate}</span>
        </h4>
      ) : null}
      {openPosition.topics.length > 0 ||
      openPosition.customTopics.length > 0 ? (
        <ListItemTopics
          dbTopics={openPosition.topics}
          customTopics={openPosition.customTopics}
        />
      ) : null}
      <h4 className="resource-list-item-subtitle">Description of Role</h4>
      <ExpandableText resourceID={openPosition.id}>
        <p>{content.description}</p>
      </ExpandableText>
      <GroupSignature group={openPosition.group} />
    </ListItemContainer>
  );
}

export function ReducedOpenPositionListItem({
  openPosition,
  decreasedEmphasis,
  noLink,
}) {
  const content = openPosition.content;
  if (!openPosition) return null;
  const titleDisplay = noLink ? (
    <h3 style={decreasedEmphasis ? {color: '#5d5d65'} : null}>
      {content.title}
    </h3>
  ) : (
    <Link to={`/openPosition/${openPosition.id}`}>
      <h3 style={decreasedEmphasis ? {color: '#5d5d65'} : null}>
        {content.title}
      </h3>
    </Link>
  );
  return (
    <ListItemContainer>
      {titleDisplay}
      {openPosition.topics.length > 0 ||
      openPosition.customTopics.length > 0 ? (
        <ListItemTopics
          dbTopics={openPosition.topics}
          customTopics={openPosition.customTopics}
        />
      ) : null}
      <h4 className="resource-list-item-subtitle">Description of Role</h4>
      <div className="article-list-item-small-description">
        <p>{content.description}</p>
      </div>
    </ListItemContainer>
  );
}
