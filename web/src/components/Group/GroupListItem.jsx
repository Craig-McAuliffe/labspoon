import React, {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import SeeMore from '../SeeMore';
import GroupAvatar from '../Avatar/GroupAvatar';

import './GroupListItem.css';
import FollowOptionsPopover from '../Popovers/FollowOptionsPopover';
import {GROUP} from '../../helpers/resourceTypeDefinitions';
import Popover from '../Popovers/Popover';
import TertiaryButton from '../Buttons/TertiaryButton';

export default function GroupListItem({
  group,
  LinkOverride = undefined,
  noBorder,
  children,
  isFollowsPageResults,
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
    <div className={`group-list-item-container${noBorder ? '-no-border' : ''}`}>
      <GroupAvatarSection
        groupAvatar={group.avatar}
        height={130}
        width={130}
        WrapWithLinkOrOverride={WrapWithLinkOrOverride}
      />
      <div>
        <div className="group-list-item-name-follow">
          <div className="group-list-item-name-institution-container">
            {name}
            <h4>{group.institution}</h4>
          </div>
          <div className="group-list-item-follow-button-container">
            {children}
            {isFollowsPageResults && (
              <div className="group-list-item-follow-options-container">
                <FollowsPageGroupListItemOptions
                  resourceType={GROUP}
                  targetResourceData={group}
                />
              </div>
            )}
          </div>
        </div>
        <div className="group-list-item-text-container">
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
            descriptionRef={groupDescriptionRef}
            id={group.id}
          />
        </div>
      </div>
    </div>
  );
}

function GroupAvatarSection({
  groupAvatar,
  height,
  width,
  WrapWithLinkOrOverride,
}) {
  const avatarDisplay = (
    <div className="group-list-item-icon">
      <GroupAvatar src={groupAvatar} height={height} width={width} />
    </div>
  );
  if (WrapWithLinkOrOverride === undefined) return avatarDisplay;
  return <WrapWithLinkOrOverride>{avatarDisplay}</WrapWithLinkOrOverride>;
}

export function GroupDropdownItem({group}) {
  return (
    <div className="group-dropdown-item">
      <GroupAvatarSection groupAvatar={group.avatar} height={80} width={80} />
      <GroupNameInstitution name={group.name} institution={group.institution} />
    </div>
  );
}

export function GroupHeadlineItem({group}) {
  return (
    <div className="group-headline-item-container">
      <GroupAvatarSection groupAvatar={group.avatar} height={80} width={80} />
      <div>
        <GroupNameInstitution
          name={group.name}
          institution={group.institution}
        />
      </div>
    </div>
  );
}

function GroupNameInstitution({name, institution}) {
  return (
    <>
      <h3 className="group-dropdown-item-name">{name}</h3>
      <h4 className="group-dropdown-item-institution">{institution}</h4>
    </>
  );
}

export function FollowsPageGroupListItemOptions({
  targetResourceData,
  resourceType,
}) {
  const getFollowOptionsPopover = () => (
    <FollowOptionsPopover
      targetResourceData={targetResourceData}
      resourceType={resourceType}
      isPreSelected={true}
      top="40px"
      right="0vw"
    />
  );
  return (
    <Popover getPopUpComponent={getFollowOptionsPopover}>
      <TriggerGroupFollowOptionsButton actionAndTriggerPopUp={() => {}} />
    </Popover>
  );
}

function TriggerGroupFollowOptionsButton({actionAndTriggerPopUp}) {
  return (
    <div className="group-list-item-follow-options-button-container">
      <TertiaryButton onClick={actionAndTriggerPopUp}>Options</TertiaryButton>
    </div>
  );
}
