import React from 'react';
import {Link} from 'react-router-dom';
import SearchBar from '../../SearchBar';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';

import './Header.css';

const Header = () => {
  return (
    <div className="header-container">
      <Link to="/">
        <div className="header-logo">
          <HeaderLogo />
        </div>
      </Link>
      <SearchBar />
      <div className="header-drop-down">
        <AvatarDropDown />
      </div>
    </div>
  );
};

export default Header;
