import React, {useState} from 'react';
import {useHistory, Link} from 'react-router-dom';
import SearchIcon from '../assets/searchIcon.svg';
import {searchStateToURL} from '../helpers/search';

import './SearchBar.css';

export default function SearchBar({
  bigSearchPrompt,
  aboutPageSearch,
  placeholderText,
  children,
}) {
  const formClassName =
    bigSearchPrompt || aboutPageSearch ? 'big-search-form' : 'search-form';
  const inputClassName =
    bigSearchPrompt || aboutPageSearch ? 'big-search-input' : 'search-input';
  const buttonClassName =
    bigSearchPrompt || aboutPageSearch
      ? 'big-search-icon-container'
      : 'search-icon-container';

  if (bigSearchPrompt || aboutPageSearch)
    return (
      <div>
        {aboutPageSearch ? null : children ? (
          children
        ) : (
          <h3 className="big-search-prompt-text">
            {`Search for something that interests you and follow for updates!`}
          </h3>
        )}
        <div className="big-search-container">
          <div></div>
          <SearchForm
            placeholderText={placeholderText}
            formClassName={formClassName}
            inputClassName={inputClassName}
            buttonClassName={buttonClassName}
          />
          <div></div>
          <div></div>
          <div className="big-search-suggested-searches-container">
            <span className="search-bar-suggested-searches-prompt">
              Suggested Searches:
            </span>
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
      <div className="search-bar">
        <SearchForm
          placeholderText={placeholderText}
          formClassName={formClassName}
          inputClassName={inputClassName}
          buttonClassName={buttonClassName}
        />
      </div>
    </div>
  );
}

function SearchForm({
  placeholderText,
  formClassName,
  inputClassName,
  buttonClassName,
  onFocus,
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
  return (
    <form onSubmit={onSubmit} className={formClassName}>
      <input
        className={inputClassName}
        placeholder={placeholderText ? placeholderText : 'Search for research'}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={onFocus}
        type="text"
      />
      <button
        type="submit"
        value="Submit"
        className={buttonClassName}
        style={{backgroundImage: `url(${SearchIcon})`}}
      ></button>
    </form>
  );
}

export function MinimisedSearchBar({expanded, onFocus}) {
  const formClassName = `minimised-search-form${expanded ? '-expanded' : ''}`;
  const inputClassName = `minimised-search-bar-input${
    expanded ? '-expanded' : ''
  }`;
  const buttonClassName = 'search-icon-container';

  return (
    <div className="search-bar-relative-positioning">
      <div
        className={`minimised-search-bar-container${
          expanded ? '-expanded' : ''
        }`}
      >
        <SearchForm
          placeholderText="Search"
          formClassName={formClassName}
          inputClassName={inputClassName}
          buttonClassName={buttonClassName}
          onFocus={onFocus}
        />
      </div>
    </div>
  );
}
