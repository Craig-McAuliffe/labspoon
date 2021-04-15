import React from 'react';
import {Link} from 'react-router-dom';
import ListItemTopics from '../ListItem/ListItemTopics';
import GroupSignature from '../Group/GroupSignature';
import {
  ExpandableText,
  ListItemContainer,
  ListItemOptionsDropdown,
  PIN,
} from '../ListItem/ListItemCommonComponents';
import {OPENPOSITION} from '../../helpers/resourceTypeDefinitions';

import './OpenPositionListItem.css';
import {RichTextBody} from '../Article/Article';

export default function OpenPositionListItem({openPosition}) {
  const content = openPosition.content;

  if (!openPosition) return null;
  return (
    <ListItemContainer backgroundShade={openPosition.backgroundShade}>
      {openPosition.showPinOption && (
        <ListItemOptionsDropdown
          resourceType={OPENPOSITION}
          resourceID={openPosition.id}
          item={openPosition}
          pinProfileID={openPosition.pinProfileID}
          pinProfileCollection={openPosition.pinProfileCollection}
          options={[PIN]}
          backgroundShade={openPosition.backgroundShade}
        />
      )}
      <Link
        className={`list-item-title-${
          openPosition.backgroundShade ? openPosition.backgroundShade : 'light'
        }`}
        to={`/openPosition/${openPosition.id}`}
      >
        <h3>{content.title}</h3>
      </Link>

      {content.position && content.position.length > 0 && (
        <h4
          className={`list-item-inline-subtitle-${
            openPosition.backgroundShade
              ? openPosition.backgroundShade
              : 'light'
          }`}
        >
          Position
          <span>{content.position}</span>
        </h4>
      )}
      {content.salary.length > 0 ? (
        <h4
          className={`list-item-inline-subtitle-${
            openPosition.backgroundShade
              ? openPosition.backgroundShade
              : 'light'
          }`}
        >
          Salary
          <span>{content.salary}</span>
        </h4>
      ) : null}
      {content.startDate.length > 0 ? (
        <h4
          className={`list-item-inline-subtitle-${
            openPosition.backgroundShade
              ? openPosition.backgroundShade
              : 'light'
          }`}
        >
          Start date
          <span>{content.startDate}</span>
        </h4>
      ) : null}
      <div className="open-position-list-item-description-section">
        <h4
          className={`list-item-inline-subtitle-${
            openPosition.backgroundShade
              ? openPosition.backgroundShade
              : 'light'
          }`}
        >
          Description of Role
        </h4>
        <ExpandableText
          backgroundShade={openPosition.backgroundShade}
          resourceID={openPosition.id}
        >
          <RichTextBody
            backgroundShade={openPosition.backgroundShade}
            body={content.description}
            expandable={true}
            id={openPosition.id}
          />
        </ExpandableText>
      </div>
      {openPosition.topics.length > 0 ||
      (openPosition.customTopics && openPosition.customTopics.length > 0) ? (
        <ListItemTopics
          dbTopics={openPosition.topics}
          customTopics={openPosition.customTopics}
          backgroundShade={openPosition.backgroundShade}
        />
      ) : null}

      <GroupSignature
        backgroundShade={openPosition.backgroundShade}
        group={openPosition.group}
      />
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
    <h3
      style={decreasedEmphasis ? {color: '#5d5d65'} : null}
      className={`list-item-title-${
        openPosition.backgroundShade ? openPosition.backgroundShade : 'light'
      }`}
    >
      {content.title}
    </h3>
  ) : (
    <Link
      to={`/openPosition/${openPosition.id}`}
      className={`list-item-title-${
        openPosition.backgroundShade ? openPosition.backgroundShade : 'light'
      }`}
    >
      <h3 style={decreasedEmphasis ? {color: '#5d5d65'} : null}>
        {content.title}
      </h3>
    </Link>
  );
  return (
    <ListItemContainer backgroundShade={openPosition.backgroundShade}>
      {titleDisplay}
      <div className="open-position-list-item-description-section">
        <h4
          className={`list-item-subtitle-${
            openPosition.backgroundShade
              ? openPosition.backgroundShade
              : 'light'
          }`}
        >
          Description of Role
        </h4>
        <div className="article-list-item-small-description">
          <RichTextBody
            body={content.description}
            expandable={false}
            id={openPosition.id}
            backgroundShade={openPosition.backgroundShade}
          />
        </div>
      </div>
    </ListItemContainer>
  );
}
