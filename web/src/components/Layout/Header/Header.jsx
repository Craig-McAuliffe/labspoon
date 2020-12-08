import React from 'react';
import {Link} from 'react-router-dom';
import SearchBar from '../../SearchBar';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import {CreateButton} from '../../../assets/HeaderIcons';

import './Header.css';

const Header = () => {
  return (
    <div className="header-container">
      <Link to="/" className="header-home-link">
        <div className="header-logo">
          <HeaderLogo />
        </div>
        <span className="header-home-text">Home</span>
      </Link>
      <SearchBar />
      <div className="header-right-section">
        <div className="header-add-button">
          <Link to="/create">
            <CreateButton />
          </Link>
        </div>
        <div className="header-drop-down">
          <AvatarDropDown />
        </div>
      </div>
    </div>
  );
};

export default Header;
