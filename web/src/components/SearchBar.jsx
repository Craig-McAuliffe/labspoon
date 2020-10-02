import React, {useState} from 'react';
import {useHistory, Link} from 'react-router-dom';
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
      <div className="big-search-suggested-searches-container">
        <h4 className="big-search-suggested-searches">Suggested Searches:</h4>
        <Link to="/search?query=SARS%20CoV-2&page=1">
          <div className="big-search-suggested-search">SARS CoV-2</div>
        </Link>
        <Link to="/search?query=Immunotherapy&page=1">
          <div className="big-search-suggested-search">Immunotherapy</div>
        </Link>
        <Link to="/search?query=RNA%20Vaccine&page=1">
          <div className="big-search-suggested-search">RNA Vaccine</div>
        </Link>
        <Link to="/search?query=Gravitational%20Waves&page=1">
          <div className="big-search-suggested-search">Gravitational Waves</div>
        </Link>
      </div>
    </div>
  ) : (
    <div className="header-search">
      <div className="search-bar">{searchForm()}</div>
    </div>
  );
}
