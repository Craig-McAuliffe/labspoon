import React, {useContext} from 'react';
// import {Dropdown, Menu} from 'antd';
import {Link} from 'react-router-dom';
import {
  BookmarksMenuIcon,
  GroupMenuIcon,
  SettingsMenuIcon,
  UserProfileMenuIcon,
} from '../../../assets/MenuIcons';

import {AuthContext} from '../../../App';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import UserAvatar from '../../Avatar/UserAvatar';
import Dropdown from 'react-bootstrap/Dropdown';
import relationships from '../../../mockdata/relationships';
import users from '../../../mockdata/users';

import './AvatarDropDown.css';

const AvatarDropDown = () => {
  const user = useContext(AuthContext);
  if (!user) {
    return (
      <Dropdown variant="success" id="dropdown-basic">
        <Link to="/login">Sign In</Link>
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
            <BookmarksMenuIcon />
            <p className="LinkItem">Bookmarks</p>
          </Dropdown.Item>
          <Dropdown.Item href={`/user/${user.uid}`}>
            <UserProfileMenuIcon />
            <p className="LinkItem">Profile</p>
          </Dropdown.Item>
          <Dropdown.Item href="/settings">
            <SettingsMenuIcon />
            <p className="LinkItem">Settings</p>
          </Dropdown.Item>
          <Dropdown.Header>
            <GroupMenuIcon />
            <span className="dropdown-group-subtitle">My Groups</span>
          </Dropdown.Header>
          <UserGroups userID={user.uid} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};

function UserGroups({userID}) {
  return relationships()
    .filter((userRelationships) => userRelationships.user.id === userID)[0]
    .memberOfGroups.map((group) => (
      <Dropdown.Item key={group.id} href={`/group/${group.id}`}>
        <p className="LinkItem">{group.name}</p>
      </Dropdown.Item>
    ));
}

const AvatarToggle = ({user, mockUser}) => (
  <div className="dropdown-header">
    {mockUser.avatar ? (
      <UserAvatar src={mockUser.avatar} width="50" height="50" />
    ) : (
      <img src={DefaultUserIcon} alt="user icon" />
    )}
    <p className="dropdown-name">{user.displayName}</p>
  </div>
);

const CustomToggle = React.forwardRef(({children, onClick}, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </a>
));

export default AvatarDropDown;

CustomToggle.displayName = CustomToggle;
