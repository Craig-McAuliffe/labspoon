import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import UserAvatar from '../Avatar/UserAvatar';
import PrimaryButton from '../Buttons/PrimaryButton';
import DefaultUserIcon from '../../assets/DefaultUserIcon.svg';
import {AuthContext} from '../../App';
import './UserListItem.css';

export default function UserListItem({
  user,
  children,
  LinkOverride = undefined,
  noBorder,
}) {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;

  function WrapWithLinkOrOverride({children}) {
    if (LinkOverride) return <LinkOverride>{children}</LinkOverride>;
    return <Link to={`/user/${user.id}`}>{children}</Link>;
  }

  const details = (
    <WrapWithLinkOrOverride>
      <div className="user-listItem-link">
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
        <div className="user-listItem-name">
          <h2>{user.name}</h2>
          <h4>{user.name}</h4>
        </div>
      </div>
    </WrapWithLinkOrOverride>
  );

  return (
    <div className={`user-listItem-container${noBorder ? '-no-border' : ''}`}>
      {details}
      <div className="user-listItem-institution">
        <h3>{user.institution}</h3>
      </div>
      {userID === user.id ? null : <div className="Follow">{children}</div>}
    </div>
  );
}

export function UserListItemEmailOnly({user, children}) {
  return (
    <div className="user-listItem-container">
      <div className="user-listItem-link">
        <AvatarSection />
        <div className="user-listItem-email">
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
    <div className="user-listItem-container">
      <div className="user-listItem-link">
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
      <div className="user-listItem-institution">
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
