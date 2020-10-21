import React, {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import SeeMore from '../SeeMore';
import FollowGroupButton from './FollowGroupButton';
import GroupAvatar from '../Avatar/GroupAvatar';

import './GroupListItem.css';

export default function GroupListItem({group}) {
  const [displayFullDescription, setDisplayFullDescription] = useState({
    display: false,
    size: 100,
  });

  const groupDescriptionRef = useRef();

  const descriptionSize = {
    height: `${displayFullDescription.size}px`,
  };

  return (
    <div className="group-list-item-container">
      <Link to={`/group/${group.id}`}>
        <div className="group-list-item-icon-and-name">
          <GroupAvatar src={group.avatar} height="100" width="100" />
          <p>{group.name}</p>
        </div>
      </Link>
      <div className="group-list-item-text-container">
        <Link to={`/group/${group.id}`}>
          <h3>{group.name}</h3>
        </Link>
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
      <div className="follow-group-button">
        <FollowGroupButton targetGroup={group} />
      </div>
    </div>
  );
}
