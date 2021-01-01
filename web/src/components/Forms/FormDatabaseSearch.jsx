import React from 'react';
import {abbrEnv} from '../../config';

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
  const resourceResults = ({searchResults}) => {
    if (
      (!searchResults || searchResults.query.length === 0) &&
      displayedItems.length > 0 &&
      clearListOnNoResults
    ) {
      setDisplayedItems([]);
    }
    if (searchResults) {
      if (searchResults.nbHits !== 0 && searchResults.query.length > 0) {
        setDisplayedItems(searchResults.hits);
      }
    }
    return null;
  };

  const CustomStateResourceResults = connectStateResults(resourceResults);
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

        <CustomStateResourceResults />
        <Configure hitsPerPage={10} />
      </InstantSearch>
    </div>
  );
}
