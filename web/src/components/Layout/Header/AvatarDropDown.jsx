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
import NoUserIcon from '../../../assets/NoUserIcon.svg';
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
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link to="/bookmarks">
              <BookmarksMenuIcon className="MenuIcons" />
              <p className="LinkItem">Bookmarks</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link to="/account">
              <AccountMenuIcon className="MenuIcons" />
              <p className="LinkItem">Account</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link to="/userprofile">
              <UserProfileMenuIcon className="MenuIcons" />
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
    <img src={NoUserIcon} alt="user icon" />
    <p>First Name</p>
  </div>
);

export const AvatarDropDownSmall = () => {
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
          <AvatarToggleSmall />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link to="/bookmarks">
              <BookmarksMenuIcon className="MenuIcons" />
              <p className="LinkItem">Bookmarks</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link to="/account">
              <AccountMenuIcon className="MenuIcons" />
              <p className="LinkItem">Account</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link to="/userprofile">
              <UserProfileMenuIcon className="MenuIcons" />
              <p className="LinkItem">Profile</p>
            </Link>
          </Dropdown.Item>
          <Dropdown.Header>
            <GroupMenuIcon />
            My Groups
          </Dropdown.Header>
          <Dropdown.Item>
            <p className="LinkItem">The bla bla group</p>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};

const AvatarToggleSmall = () => (
  <div className="DropDownHeader">
    <img src={NoUserIcon} alt="user icon" />
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

// const menu = (
//   <Menu>
//     <Menu.Item key="0">
//       <BookmarksMenuIcon className="MenuIcons" />
//       <Link to="/bookmarks">Bookmarks</Link>
//     </Menu.Item>
//     <Menu.Item key="1">
//       <UserProfileMenuIcon className="MenuIcons" />
//       <Link to="/userprofile">Profile</Link>
//     </Menu.Item>
//     <Menu.Item key="2">
//       <AccountMenuIcon className="MenuIcons" />
//       <Link to="/account">Account</Link>
//     </Menu.Item>
//     <Menu.Item key="3">
//       <GroupMenuIcon />
//       <p>Groups</p>
//       <Link to="/group">My Group</Link>
//     </Menu.Item>
//   </Menu>
// );

// const signInMenu = (
//   <Menu>
//     <Menu.Item key="0">
//       <Link to="/login">Sign in</Link>
//     </Menu.Item>
//   </Menu>
// );

export default AvatarDropDown;
