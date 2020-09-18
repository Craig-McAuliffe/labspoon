import React from 'react';
import {Link, useHistory} from 'react-router-dom';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import {SearchIcon, SearchIconSmall} from '../../../assets/HeaderIcons';
import './Header.css';
import {useState} from 'react';

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

function SearchBar() {
  const [query, setQuery] = useState(undefined);
  const history = useHistory();
  function onSubmit(event) {
    event.preventDefault();
    history.push('search/' + query);
  }
  return (
    <div className="header-search">
      <div className="search-bar">
        <form onSubmit={onSubmit}>
          <button type="submit" value="Submit">
            <div className="search-icon">
              <SearchIcon />
            </div>
            <div className="search-icon-small">
              <SearchIconSmall />
            </div>
          </button>
          <input
            placeholder="Search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
      </div>
    </div>
  );
}

export default Header;
