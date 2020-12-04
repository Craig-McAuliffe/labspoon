import React, {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import SeeMore from '../SeeMore';
import FollowGroupButton from './FollowGroupButton';
import GroupAvatar from '../Avatar/GroupAvatar';

import './GroupListItem.css';

export default function GroupListItem({group, LinkOverride = undefined}) {
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

  const avatar = (
    <WrapWithLinkOrOverride>
      <div className="group-list-item-icon-and-name">
        <GroupAvatar src={group.avatar} height="100" width="100" />
        <p>{group.name}</p>
      </div>
    </WrapWithLinkOrOverride>
  );

  const name = (
    <WrapWithLinkOrOverride>
      <h3>{group.name}</h3>
    </WrapWithLinkOrOverride>
  );

  return (
    <div className="group-list-item-container">
      {avatar}
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
      <div className="follow-group-button">
        <FollowGroupButton targetGroup={group} />
      </div>
    </div>
  );
}
