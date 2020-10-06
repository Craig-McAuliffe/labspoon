import React, {useContext} from 'react';
// import {Dropdown, Menu} from 'antd';
import {Link} from 'react-router-dom';
import {
  BookmarksMenuIcon,
  GroupMenuIcon,
  SettingsMenuIcon,
  UserProfileMenuIcon,
  CreateGroupIcon,
  FollowIcon,
} from '../../../assets/MenuIcons';

import {AuthContext} from '../../../App';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import UserAvatar from '../../Avatar/UserAvatar';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomToggle from '../../CustomToggle';
import relationships from '../../../mockdata/relationships';
import users from '../../../mockdata/users';
import firebase from '../../../firebase';

import './AvatarDropDown.css';

const AvatarDropDown = () => {
  const {user} = useContext(AuthContext);
  if (!user) {
    return (
      <Dropdown variant="success" id="dropdown-basic">
        <Link to="/login" className="sign-in">
          <h3>Sign In</h3>
        </Link>
      </Dropdown>
    );
  } else {
    const mockUser = users().filter((mockUser) => mockUser.id === user.uid)[0];
    return (
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
          <AvatarToggle user={user} mockUser={mockUser} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href="/bookmarks">
            <div className="avatar-dropdown-item-container">
              <BookmarksMenuIcon />
              <p className="link-item">Bookmarks</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href="/follows">
            <div className="avatar-dropdown-item-container">
              <FollowIcon />
              <p className="link-item">Follows</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href={`/user/${user.uid}`}>
            <div className="avatar-dropdown-item-container">
              <UserProfileMenuIcon />
              <p className="link-item">Profile</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href="/settings">
            <div className="avatar-dropdown-item-container">
              <SettingsMenuIcon />
              <p className="link-item">Settings</p>
            </div>
          </Dropdown.Item>
          <div className="log-out-container">
            <button
              onClick={() => {
                firebase.auth().signOut();
              }}
              className="log-out-button"
            >
              Log out
            </button>
          </div>
          <div className="dropdown-divider"></div>
          <Dropdown.Header>
            <GroupMenuIcon />
            <div className="dropdown-group-subtitle">My Groups</div>
          </Dropdown.Header>
          <UserGroups userID={user.uid} />
          <Dropdown.Item href="/group/create">
            <CreateGroupIcon />
            <p className="link-item">Create Group</p>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};

function UserGroups({userID}) {
  const matchedUserRelationships = relationships().filter(
    (userRelationships) => userRelationships.user.id === userID
  )[0];
  if (matchedUserRelationships === undefined) return null;
  return matchedUserRelationships.memberOfGroups.map((group) => (
    <Dropdown.Item key={group.id} href={`/group/${group.id}`}>
      <p className="link-item">{group.name}</p>
    </Dropdown.Item>
  ));
}

const AvatarToggle = ({user, mockUser}) => (
  <div className="dropdown-header">
    {mockUser ? (
      <UserAvatar src={mockUser.avatar} width="50" height="50" />
    ) : (
      <img src={DefaultUserIcon} alt="user icon" />
    )}
    <p className="dropdown-name">{user.displayName}</p>
  </div>
);

export default AvatarDropDown;
