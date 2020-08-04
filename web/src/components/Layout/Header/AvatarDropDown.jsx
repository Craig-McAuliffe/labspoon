import React, {useContext} from 'react';
// import {Dropdown, Menu} from 'antd';
import {Link} from 'react-router-dom';
import {
  BookmarksMenuIcon,
  GroupMenuIcon,
  AccountMenuIcon,
  UserProfileMenuIcon,
} from '../../../assets/MenuIcons';

import {AuthContext} from '../../../App';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import Dropdown from 'react-bootstrap/Dropdown';

import './AvatarDropDown.css';

const AvatarDropDown = () => {
  const {user} = useContext(AuthContext);
  if (!user) {
    return (
      <Dropdown variant="success" id="dropdown-basic">
        <Link to="/signin">Sign In</Link>
      </Dropdown>
    );
  } else {
    return (
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
          <AvatarToggle />
          <AvatarToggleSmall />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link to="/bookmarks">
              <BookmarksMenuIcon />
              <p className="LinkItem">Bookmarks</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link to="/settings">
              <AccountMenuIcon />
              <p className="LinkItem">Account Settings</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link to="/profile">
              <UserProfileMenuIcon />
              <p className="LinkItem">Profile</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Header>
            <GroupMenuIcon />
            My Groups
          </Dropdown.Header>
          <Dropdown.Item>
            <Link to="/group">
              <p className="LinkItem">The bla bla group</p>
            </Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};

const AvatarToggle = () => (
  <div className="DropDownHeader">
    <img src={DefaultUserIcon} alt="user icon" />
    <p>First Name</p>
  </div>
);

const AvatarToggleSmall = () => (
  <div className="DropDownHeaderSmall">
    <img src={DefaultUserIcon} alt="user icon" />
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
