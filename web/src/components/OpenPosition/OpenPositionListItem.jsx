import React from 'react';
import {Link} from 'react-router-dom';
import ListItemTopics from '../ListItem/ListItemTopics';
import GroupSignature from '../Group/GroupSignature';
import {
  ExpandableText,
  ListItemContainer,
  ListItemOptionsDropdown,
} from '../ListItem/ListItemCommonComponents';
import {OPENPOSITION} from '../../helpers/resourceTypeDefinitions';

import './OpenPositionListItem.css';
import {RichTextBody} from '../Article/Article';

export default function OpenPositionListItem({openPosition}) {
  const content = openPosition.content;

  if (!openPosition) return null;
  return (
    <ListItemContainer>
      {openPosition.showPinOption && (
        <ListItemOptionsDropdown
          resourceType={OPENPOSITION}
          resourceID={openPosition.id}
          item={openPosition}
          pinProfileID={openPosition.pinProfileID}
          pinProfileCollection={openPosition.pinProfileCollection}
        />
      )}
      <Link to={`/openPosition/${openPosition.id}`}>
        <h3>{content.title}</h3>
      </Link>
      {content.position && content.position.length > 0 && (
        <h4 className="resource-list-item-inline-subtitle">
          Position
          <span>{content.position}</span>
        </h4>
      )}
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
      (openPosition.customTopics && openPosition.customTopics.length > 0) ? (
        <ListItemTopics
          dbTopics={openPosition.topics}
          customTopics={openPosition.customTopics}
        />
      ) : null}
      <h4 className="resource-list-item-subtitle">Description of Role</h4>
      <ExpandableText resourceID={openPosition.id}>
        <RichTextBody
          body={content.description}
          expandable={true}
          id={openPosition.id}
        />
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
      <h4 className="resource-list-item-subtitle">Description of Role</h4>
      <div className="article-list-item-small-description">
        <p>{content.description}</p>
      </div>
    </ListItemContainer>
  );
}
