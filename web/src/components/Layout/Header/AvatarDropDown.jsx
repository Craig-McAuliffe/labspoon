import React, {useContext, useState} from 'react';
import {Link} from 'react-router-dom';
import {
  BookmarksMenuIcon,
  GroupMenuIcon,
  SettingsMenuIcon,
  UserProfileMenuIcon,
  FollowIcon,
} from '../../../assets/MenuIcons';

import {db} from '../../../firebase';
import {AuthContext} from '../../../App';
import UserAvatar from '../../Avatar/UserAvatar';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomToggle from '../../CustomToggle';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../../helpers/groups';
import firebase from '../../../firebase';

import './AvatarDropDown.css';

const AvatarDropDown = () => {
  const {user, userProfile} = useContext(AuthContext);
  if (!user) {
    return (
      <Dropdown variant="success" id="dropdown-basic">
        <Link to="/login" className="sign-in">
          <h3>Sign In</h3>
        </Link>
      </Dropdown>
    );
  } else {
    return (
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
          <AvatarToggle user={user} userProfile={userProfile} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href="/bookmarks">
            <div className="avatar-dropdown-item-container">
              <BookmarksMenuIcon />
              <p className="dropdown-link-item">Bookmarks</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href="/follows">
            <div className="avatar-dropdown-item-container">
              <FollowIcon />
              <p className="dropdown-link-item">Things I follow</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href={`/user/${user.uid}`}>
            <div className="avatar-dropdown-item-container">
              <UserProfileMenuIcon />
              <p className="dropdown-link-item">Profile</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href="/settings">
            <div className="avatar-dropdown-item-container">
              <SettingsMenuIcon />
              <p className="dropdown-link-item">Settings</p>
            </div>
          </Dropdown.Item>
          <Dropdown.Item href="/privacyPolicy">
            <div className="avatar-dropdown-item-container">
              <p className="dropdown-link-item">Privacy Policy</p>
            </div>
          </Dropdown.Item>
          <div className="log-out-container">
            <button
              onClick={() => {
                firebase
                  .auth()
                  .signOut()
                  .then(() => window.location.reload())
                  .catch((err) => {
                    alert(
                      'Something went wrong trying to sign you out. We are working on it. Please try again later'
                    );
                    console.error('unable to sign user out ', err);
                  });
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
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};

function UserGroups({userID}) {
  const [listOfGroups, setListOfGroups] = useState([]);
  const memberOfGroupsCollection = db.collection(`users/${userID}/groups`);

  getPaginatedGroupReferencesFromCollectionRef(
    memberOfGroupsCollection,
    10
  ).then((result) => {
    setListOfGroups(result);
  });
  return listOfGroups === undefined
    ? null
    : listOfGroups.map((group) => (
        <Dropdown.Item key={group.id} href={`/group/${group.id}`}>
          <p className="dropdown-link-item">
            {group.name.slice(0, 32)} {group.name.length > 32 ? '...' : null}
          </p>
        </Dropdown.Item>
      ));
}

const AvatarToggle = ({userProfile}) => {
  return (
    <div className="dropdown-header">
      {userProfile ? (
        <UserAvatar src={userProfile.avatar} width="50" height="50" />
      ) : (
        <UserAvatar width="50" height="50" />
      )}
      <p className="dropdown-name">Me</p>
    </div>
  );
};

export default AvatarDropDown;
