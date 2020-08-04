import React from 'react';
import {Link} from 'react-router-dom';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import {SearchIcon, SearchIconSmall} from '../../../assets/HeaderIcons';
import './Header.css';

const Header = () => {
  return (
    <div className="HeaderContainer">
      <Link to="/">
        <div className="HeaderLogo">
          <HeaderLogo />
        </div>
      </Link>
      <div className="HeaderSearch">
        <div className="SearchIcon">
          <SearchIcon />
        </div>
        <div className="SearchIconSmall">
          <SearchIconSmall />
        </div>
        <input placeholder=" Search" type="text" />
      </div>
      <div className="HeaderDropDown">
        <AvatarDropDown />
      </div>
    </div>
  );
};

export default Header;
