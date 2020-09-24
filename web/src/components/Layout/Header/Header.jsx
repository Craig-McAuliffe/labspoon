import React, {useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {searchStateToURL} from '../../../helpers/search';

import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import SearchIcon from '../../../assets/searchIcon.svg';

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

function SearchBar() {
  const [query, setQuery] = useState(undefined);
  const history = useHistory();
  function onSubmit(event) {
    event.preventDefault();
    history.push(
      searchStateToURL({pathname: '/search'}, {query: query, page: 1})
    );
  }
  return (
    <div className="header-search">
      <div className="search-bar">
        <form onSubmit={onSubmit} className="search-form">
          <input
            placeholder="  Search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
          />
          <button
            type="submit"
            value="Submit"
            className="search-icon-container"
            style={{backgroundImage: `url(${SearchIcon})`}}
          ></button>
        </form>
      </div>
    </div>
  );
}

export default Header;
