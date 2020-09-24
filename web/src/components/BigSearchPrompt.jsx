import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import SearchIcon from '../assets/searchIcon.svg';
import {searchStateToURL} from '../helpers/search';

import './BigSearchPrompt.css';

export default function BigSearchPrompt() {
  const history = useHistory();
  const [query, setQuery] = useState(undefined);

  function onSubmit(event) {
    event.preventDefault();
    history.push(
      searchStateToURL({pathname: '/search'}, {query: query, page: 1})
    );
  }

  return (
    <div>
      <h3 className="big-search-prompt-text">
        {`Search for something that interests you and follow for updates!`}
      </h3>
      <form onSubmit={onSubmit} className="big-search-container">
        <input
          className="big-search-input"
          placeholder="Search for research"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="submit"
          value="Submit"
          className="big-search-icon-container"
          style={{backgroundImage: `url(${SearchIcon})`}}
        ></button>
      </form>
    </div>
  );
}
