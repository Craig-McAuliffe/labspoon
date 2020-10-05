import React from 'react';

import {SearchIconGrey} from '../../assets/HeaderIcons';
import {
  InstantSearch,
  SearchBox,
  Configure,
  connectStateResults,
} from 'react-instantsearch-dom';
import {searchClient} from '../../algolia';

import './FormDatabaseSearch.css';

export default function FormDatabaseSearch({
  setDisplayedItems,
  inputRef,
  indexName,
  placeholderText,
  hideSearchIcon,
  displayedItems,
  clearListOnNoResults,
}) {
  const abbrEnv = 'dev';

  const UsersResults = ({searchResults}) => {
    if (searchResults) {
      if (searchResults.nbHits !== 0 && searchResults.query.length > 0) {
        setDisplayedItems(searchResults.hits);
      }
      if (
        searchResults.query.length === 0 &&
        displayedItems.length > 0 &&
        clearListOnNoResults
      ) {
        setDisplayedItems([]);
      }
    }
    return null;
  };

  const CustomStateUsers = connectStateResults(UsersResults);
  return (
    <div
      className="form-database-search-container"
      ref={inputRef ? inputRef : null}
    >
      {hideSearchIcon ? null : <SearchIconGrey />}
      <InstantSearch
        searchClient={searchClient}
        indexName={abbrEnv + indexName}
        onSearchStateChange={() => setDisplayedItems([])}
      >
        <SearchBox
          translations={{
            placeholder: placeholderText,
          }}
        />

        <CustomStateUsers />
        <Configure hitsPerPage={10} />
      </InstantSearch>
    </div>
  );
}
