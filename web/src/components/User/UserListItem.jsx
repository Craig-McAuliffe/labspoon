import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import UserAvatar from '../Avatar/UserAvatar';
import PrimaryButton from '../Buttons/PrimaryButton';
import DefaultUserIcon from '../../assets/DefaultUserIcon.svg';
import {AuthContext} from '../../App';
import './UserListItem.css';
import {FollowsPageListItemOptions} from '../Popovers/FollowOptionsPopover';
import {USER} from '../../helpers/resourceTypeDefinitions';

export default function UserListItem({
  user,
  children,
  LinkOverride = undefined,
  noBorder,
  isFollowsPageResults,
  overrideDisplayForSelf,
}) {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;

  function WrapWithLinkOrOverride({children}) {
    if (LinkOverride) return <LinkOverride>{children}</LinkOverride>;
    return <Link to={`/user/${user.id}`}>{children}</Link>;
  }

  const details = (
    <div
      className={`user-list-item-link-${
        user.backgroundShade ? user.backgroundShade : 'light'
      }`}
    >
      <WrapWithLinkOrOverride>
        <div className="Avatar">
          {user.avatar ? (
            <UserAvatar src={user.avatar} width="60px" height="60px" />
          ) : (
            <img
              src={DefaultUserIcon}
              alt="default user icon"
              className="user-list-item-default-avatar"
            />
          )}
        </div>
        <div className="AvatarSmall">
          {user.avatar ? (
            <UserAvatar src={user.avatar} width="40px" height="40px" />
          ) : (
            <img
              src={DefaultUserIcon}
              alt="default user icon"
              className="user-list-item-default-small"
            />
          )}
        </div>
      </WrapWithLinkOrOverride>

      <div className="user-list-item-name">
        <WrapWithLinkOrOverride>
          <h2>{user.name}</h2>
          <h4>{user.name}</h4>
        </WrapWithLinkOrOverride>
      </div>
    </div>
  );

  let containerClassName = `user-list-item-container-${
    user.backgroundShade ? user.backgroundShade : 'light'
  }`;
  if (noBorder) containerClassName = containerClassName + '-no-border';
  if (isFollowsPageResults)
    containerClassName = 'user-list-item-container-follows-options';

  return (
    <div className={containerClassName}>
      {details}
      <div
        className={`user-list-item-institution-${
          user.backgroundShade ? user.backgroundShade : 'light'
        }`}
      >
        {isFollowsPageResults ? (
          <FollowsPageListItemOptions
            targetResourceData={user}
            resourceType={USER}
          />
        ) : (
          <h3>{user.institution}</h3>
        )}
      </div>
      {userID === user.id && !overrideDisplayForSelf ? null : (
        <div className="Follow">{children}</div>
      )}
    </div>
  );
}

export function UserListItemEmailOnly({user, children}) {
  return (
    <div className="user-list-item-container">
      <div className="user-list-item-link">
        <AvatarSection />
        <div className="user-list-item-email">
          <h2>{user.email}</h2>
        </div>
      </div>
      <div className="Follow">{children}</div>
    </div>
  );
}

function AvatarSection({avatar}) {
  return (
    <>
      <div className="Avatar">
        {avatar ? (
          <UserAvatar src={avatar} width="60px" height="60px" />
        ) : (
          <img
            src={DefaultUserIcon}
            alt="default user icon"
            className="user-list-item-default-avatar"
          />
        )}
      </div>
      <div className="AvatarSmall">
        {avatar ? (
          <UserAvatar src={avatar} width="40px" height="40px" />
        ) : (
          <img
            src={DefaultUserIcon}
            alt="default user icon"
            className="user-list-item-default-small"
          />
        )}
      </div>
    </>
  );
}

export function UserSmallResultItem({user, selectUser}) {
  const select = () => selectUser(user);
  return (
    <div
      className={`user-list-item-container-${
        user.backgroundShade ? user.backgroundShade : 'light'
      }`}
    >
      <div
        className={`user-list-item-link-${
          user.backgroundShade ? user.backgroundShade : 'light'
        }`}
      >
        {user.avatar ? (
          <UserAvatar src={user.avatar} width="40px" height="40px" />
        ) : (
          <img
            src={DefaultUserIcon}
            alt="default user icon"
            className="user-list-item-default-small"
          />
        )}
        <h4>{user.name}</h4>
      </div>
      <div
        className={`user-list-item-institution-${
          user.backgroundShade ? user.backgroundShade : 'light'
        }`}
      >
        <h4>{user.institution}</h4>
      </div>
      <div className="Follow">
        <PrimaryButton onClick={select} smallVersion>
          Select
        </PrimaryButton>
      </div>
    </div>
  );
}
