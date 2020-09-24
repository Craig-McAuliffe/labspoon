import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import SearchIcon from '../assets/searchIcon.svg';
import {searchStateToURL} from '../helpers/search';

import './SearchBar.css';

export default function SearchBar({bigSearchPrompt}) {
  const history = useHistory();
  const [query, setQuery] = useState(undefined);

  function onSubmit(event) {
    event.preventDefault();
    history.push(
      searchStateToURL({pathname: '/search'}, {query: query, page: 1})
    );
  }

  const searchForm = () => (
    <form
      onSubmit={onSubmit}
      className={bigSearchPrompt ? 'big-search-container' : 'search-form'}
    >
      <input
        className={bigSearchPrompt ? 'big-search-input' : 'search-input'}
        placeholder="Search for research"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        type="submit"
        value="Submit"
        className={
          bigSearchPrompt
            ? 'big-search-icon-container'
            : 'search-icon-container'
        }
        style={{backgroundImage: `url(${SearchIcon})`}}
      ></button>
    </form>
  );

  return bigSearchPrompt ? (
    <div>
      <h3 className="big-search-prompt-text">
        {`Search for something that interests you and follow for updates!`}
      </h3>
      {searchForm()}
    </div>
  ) : (
    <div className="header-search">
      <div className="search-bar">{searchForm()}</div>
    </div>
  );
}
