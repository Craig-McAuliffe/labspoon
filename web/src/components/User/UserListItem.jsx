import React from 'react';
import {Link} from 'react-router-dom';
import UserAvatar from '../Avatar/UserAvatar';
import FollowButton from '../Buttons/FollowButton';
import './UserListItem.css';

export default function UserListItem({user}) {
  return (
    <div className="user-listItem-container">
      <Link to={`/user/${user.id}`}>
        <div className="user-listItem-link">
          <div className="Avatar">
            <UserAvatar src={user.avatar} width="60px" height="60px" />
          </div>
          <div className="AvatarSmall">
            <UserAvatar src={user.avatar} width="40px" height="40px" />
          </div>
          <div className="user-listItem-name">
            <h2>{user.name}</h2>
            <h4>{user.name}</h4>
          </div>
        </div>
      </Link>
      <div className="user-listItem-institution">
        <h3>{user.institution}</h3>
      </div>
      <div className="Follow">
        <FollowButton />
      </div>
    </div>
  );
}

export function UserSmallResultItem({user, selectUser}) {
  const select = () => selectUser(user);
  return (
    <div className="user-listItem-container">
      <div className="user-listItem-link">
        <UserAvatar src={user.avatar} width="40px" height="40px" />
        <h4>{user.name}</h4>
      </div>
      <div className="user-listItem-institution">
        <h4>{user.institution}</h4>
      </div>
      <div className="Follow">
        <SelectButton select={select} />
      </div>
    </div>
  );
}

function SelectButton({select}) {
  return (
    <button type="button" className="primary-button" onClick={select}>
      <div className="primary-button-text">
        <h4>Select</h4>
      </div>
    </button>
  );
}
