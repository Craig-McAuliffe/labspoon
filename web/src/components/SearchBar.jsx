import React, {useState} from 'react';
import {useHistory, Link} from 'react-router-dom';
import SearchIcon from '../assets/searchIcon.svg';
import {searchStateToURL} from '../helpers/search';

import './SearchBar.css';

export default function SearchBar({
  bigSearchPrompt,
  aboutPageSearch,
  placeholderText,
}) {
  const history = useHistory();
  const [query, setQuery] = useState(undefined);

  function onSubmit(event) {
    event.preventDefault();
    if (!query) return;
    history.push(
      searchStateToURL({pathname: '/search'}, {query: query, page: 1})
    );
  }

  const searchForm = () => (
    <form
      onSubmit={onSubmit}
      className={
        bigSearchPrompt || aboutPageSearch ? 'big-search-form' : 'search-form'
      }
    >
      <input
        className={
          bigSearchPrompt || aboutPageSearch
            ? 'big-search-input'
            : 'search-input'
        }
        placeholder={placeholderText ? placeholderText : 'Search for research'}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        type="submit"
        value="Submit"
        className={
          bigSearchPrompt || aboutPageSearch
            ? 'big-search-icon-container'
            : 'search-icon-container'
        }
        style={{backgroundImage: `url(${SearchIcon})`}}
      ></button>
    </form>
  );

  if (bigSearchPrompt || aboutPageSearch)
    return (
      <div>
        {aboutPageSearch ? null : (
          <h3 className="big-search-prompt-text">
            {`Search for something that interests you and follow for updates!`}
          </h3>
        )}
        <div className="big-search-container">
          <div></div>
          {searchForm()}
          <div></div>
          <div></div>
          <div className="big-search-suggested-searches-container">
            <Link
              to="/search?query=Covid-19&page=1"
              className="big-search-suggested-search"
            >
              Covid-19
            </Link>
            <Link
              className="big-search-suggested-search"
              to="/search?search?query=Fusion%20Reactors&page=1"
            >
              Fusion Reactors
            </Link>
            <Link
              to="/search?query=Early%20Cancer%20Detection&page=1"
              className="big-search-suggested-search"
            >
              Early Cancer Detection
            </Link>
            <Link
              className="big-search-suggested-search"
              to="/search?query=Biodegradable%20Plastic&page=1"
            >
              Biodegradable Plastic
            </Link>
          </div>
          <div></div>
        </div>
      </div>
    );

  return (
    <div className="header-search">
      <div className="search-bar">{searchForm()}</div>
    </div>
  );
}
