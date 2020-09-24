import React from 'react';
import SearchIcon from '../assets/searchIcon.svg';

import './BigSearchPrompt.css';

export default function BigSearchPrompt() {
  return (
    <div>
      <h3 className="big-search-prompt-text">
        {`Search for something that interests you and follow for updates!`}
      </h3>
      <div className="big-search-container">
        <input
          className="big-search-input"
          placeholder="   Search for research"
        />
        <button
          type="submit"
          value="Submit"
          className="big-search-icon-container"
          style={{backgroundImage: `url(${SearchIcon})`}}
        ></button>
      </div>
    </div>
  );
}
