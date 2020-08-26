import React, {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {SeeMore} from '../../pages/ResourcePages/GroupPage/GroupPage';

import UserAvatar from '../Avatar/UserAvatar';

import './GroupFeedItem.css';
export default function GroupFeedItem({group}) {
  const [displayFullDescription, setDisplayFullDescription] = useState({
    display: false,
    size: 100,
  });

  const groupDescriptionRef = useRef();

  const descriptionSize = {
    height: `${displayFullDescription.size}px`,
  };

  return (
    <div className="group-feed-item-container">
      <Link to={`/group/${group.id}`}>
        <div className="group-feed-item-icon-and-name">
          <UserAvatar src={group.avatar} height="100" width="100" />
          <p>{group.name}</p>
        </div>
      </Link>
      <div className="group-feed-item-text-container">
        <Link to={`/group/${group.id}`}>
          <h3>{group.name}</h3>
        </Link>
        <div
          ref={groupDescriptionRef}
          style={descriptionSize}
          className="group-feed-item-description"
        >
          <p>{group.about}</p>
        </div>
        <SeeMore
          displayFullDescription={displayFullDescription}
          setDisplayFullDescription={setDisplayFullDescription}
          groupDescriptionRef={groupDescriptionRef}
        />
      </div>
    </div>
  );
}
