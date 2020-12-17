import React, {useState, useRef} from 'react';
import {Link} from 'react-router-dom';
import SeeMore from '../SeeMore';
import ListItemTopics from '../CommonListItemParts/ListItemTopics';
import ListItemContainer from '../ListItemContainers/ListItemContainer';
import GroupSignature from '../Group/GroupSignature';

import './OpenPositionListItem.css';
export default function OpenPositionListItem({openPosition}) {
  const content = openPosition.content;
  const [displayFullDescription, setDisplayFullDescription] = useState({
    display: false,
    size: content.description.length < 200 ? 100 : 150,
  });
  const descriptionRef = useRef();

  const descriptionSize = {
    height: `${displayFullDescription.size}px`,
  };

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
      <div
        ref={descriptionRef}
        style={descriptionSize}
        className="open-position-description"
      >
        <p>{content.description}</p>
      </div>
      <SeeMore
        displayFullDescription={displayFullDescription}
        setDisplayFullDescription={setDisplayFullDescription}
        descriptionRef={descriptionRef}
        id={openPosition.id}
      />
      <GroupSignature group={openPosition.group} />
    </ListItemContainer>
  );
}
