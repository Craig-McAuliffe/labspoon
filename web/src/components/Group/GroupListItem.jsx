import React, {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import SeeMore from '../SeeMore';
import GroupAvatar from '../Avatar/GroupAvatar';

import './GroupListItem.css';

export default function GroupListItem({
  group,
  LinkOverride = undefined,
  children,
}) {
  const [displayFullDescription, setDisplayFullDescription] = useState({
    display: false,
    size: 100,
  });

  const groupDescriptionRef = useRef();

  const descriptionSize = {
    height: `${displayFullDescription.size}px`,
  };

  function WrapWithLinkOrOverride({children}) {
    if (LinkOverride) return <LinkOverride>{children}</LinkOverride>;
    return <Link to={`/group/${group.id}`}>{children}</Link>;
  }

  const name = (
    <WrapWithLinkOrOverride>
      <h3>{group.name}</h3>
    </WrapWithLinkOrOverride>
  );

  return (
    <div className="group-list-item-container">
      {groupAvatar(group.avatar, 130, 130, WrapWithLinkOrOverride)}
      <div className="group-list-item-text-container">
        {name}
        <div
          ref={groupDescriptionRef}
          style={descriptionSize}
          className="group-list-item-description"
        >
          <p>{group.about}</p>
        </div>
        <SeeMore
          displayFullDescription={displayFullDescription}
          setDisplayFullDescription={setDisplayFullDescription}
          groupDescriptionRef={groupDescriptionRef}
          id={group.id}
        />
      </div>
      <div className="follow-group-button">{children}</div>
    </div>
  );
}

function groupAvatar(groupAvatar, height, width, WrapWithLinkOrOverride) {
  const avatarDisplay = (
    <div className="group-list-item-icon-and-name">
      <GroupAvatar src={groupAvatar} height={height} width={width} />
    </div>
  );
  if (WrapWithLinkOrOverride === undefined) return avatarDisplay;
  return <WrapWithLinkOrOverride>{avatarDisplay}</WrapWithLinkOrOverride>;
}

export function GroupDropdownItem({group}) {
  return (
    <div className="group-dropdown-item">
      {groupAvatar(group.avatar, 80, 80)}
      <h3 className="group-dropdown-item-name">{group.name}</h3>
      <h4 className="group-dropdown-item-institution">{group.institution}</h4>
    </div>
  );
}
