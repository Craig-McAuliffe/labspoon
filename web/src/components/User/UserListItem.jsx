import React from 'react';
import UserAvatar from '../Avatar/UserAvatar';
import FollowButton from '../Buttons/FollowButton';
import './UserListItem.css';

const UserListItem = ({user}) => {
  const userID = user.id;
  return (
    <div className="Container">
      <div className="Avatar">
        <UserAvatar
          src="https://picsum.photos/200"
          width="60px"
          height="60px"
        />
      </div>
      <div className="AvatarSmall">
        <UserAvatar
          src="https://picsum.photos/200"
          width="40px"
          height="40px"
        />
      </div>
      <div className="Name">
        <h2>
          Researcher Name based on id:<b>{userID}</b> goes here
        </h2>
        <h4>
          Researcher Name based on id:<b>{userID}</b> goes here
        </h4>
      </div>
      <div className="Follow">
        <FollowButton />
      </div>
    </div>
  );
};

export default UserListItem;
