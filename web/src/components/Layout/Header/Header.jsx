import React from 'react';
import {Link} from 'react-router-dom';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import {SearchIcon, SearchIconSmall} from '../../../assets/HeaderIcons';
import './Header.css';

const Header = () => {
  return (
    <div className="header-container">
      <Link to="/">
        <div className="header-logo">
          <HeaderLogo />
        </div>
      </Link>
      <div className="header-search">
        <div className="search-bar">
          <div className="search-icon">
            <SearchIcon />
          </div>
          <div className="search-icon-small">
            <SearchIconSmall />
          </div>
          <input placeholder=" Search" type="text" />
        </div>
      </div>
      <div className="header-drop-down">
        <AvatarDropDown />
      </div>
    </div>
  );
};

export default Header;
