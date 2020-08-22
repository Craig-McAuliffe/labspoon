import React, {useState, useEffect} from 'react';
import update from 'immutability-helper';

import {FilterMenu} from '../Filter/Filter';
import ResultsList from '../Results/Results';

import './FilterableResults.css';

const DEFAULT_TAB_ID = 'default';
export const DEFAULT_TAB_IDX = 0;

/**
 * Renders a filter and the provided results component.
 */
export default function FilterableResults({
  fetchResults,
  defaultFilter,
  limit,
  useTabs,
  useFilterSider,
}) {
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [results, setResults] = useState([]);

  const [fetchResultsState, setFetchResultsState] = useState(
    () => fetchResults
  );
  const [last, setLast] = useState(undefined);
  /**
   * Filter options has the following structure:
   * [{
   *   collectionName: string,
   *   options: [
   *     {
   *       enabled: boolean,
   *       mutable: boolean,
   *       data: {
   *         id: string
   *         name: string
   *       }
   *     }, ...
   *   ],
   * }, ...]
   */
  const [filterOptions, setFilterOptions] = useState(defaultFilter);

  if (fetchResultsState !== fetchResults) {
    setFetchResultsState(() => fetchResults);
    setSkip(0);
    setFilterOptions(defaultFilter);
  }

  useEffect(() => {
    console.log('aaa last', last, 'results', results);
    // fetchResults may return either a result set or a promise, so we convert
    // it to always a promise here
    Promise.resolve(fetchResults(skip, limit + 1, filterOptions, last)).then(
      (newResults) => {
        setHasMore(!(newResults.length <= limit));
        if (skip === 0) {
          setResults(newResults);
        } else {
          setResults(results.concat(newResults.slice(0, limit)));
        }
      }
    );
  }, [skip, fetchResultsState, filterOptions]);

  /**
   * Fetches the next page of results. Attempts to retrieve an extra result to
   * determine whether there are more results available.
   */
  function fetchMore() {
    setLast(results[results.length - 1]);
    setSkip(skip + limit);
  }

  function resetFeedFromFilterUpdate(updatedFilterOptions) {
    setFilterOptions(updatedFilterOptions);
    setLast(undefined);
    setSkip(0);
  }
  /**
   * Used by option components to update the filter when toggled.
   */
  function updateFilterOptionToState(collectionIndex, optionIndex) {
    const updatedFilterOptions = updateFilterOption(
      filterOptions,
      collectionIndex,
      optionIndex
    );
    resetFeedFromFilterUpdate(updatedFilterOptions);
  }
  /**
   * Resets all options in a collection to disabled.
   */
  function resetFilterCollectionToState(collectionIndex) {
    const updatedFilterOptions = resetFilterCollection(
      filterOptions,
      collectionIndex
    );
    resetFeedFromFilterUpdate(updatedFilterOptions);
  }
  /**
   * Resets the filter collection and sets a single value to enabled. This
   * ensures that only a single value is ever enabled on a filter collection,
   * which is useful for managing tabs.
   */
  function resetThenSetFilterCollectionToState(collectionIndex, optionIndex) {
    const resetFilterOptions = resetFilterCollection(
      filterOptions,
      collectionIndex
    );
    const updatedFilterOptions = updateFilterOption(
      resetFilterOptions,
      collectionIndex,
      optionIndex
    );
    resetFeedFromFilterUpdate(updatedFilterOptions);
  }

  const tabIDToIdx = new Map(
    filterOptions[DEFAULT_TAB_IDX].options.map((opt, i) => [opt.data.id, i])
  );

  const setTab = (tabID) => {
    if (tabID === DEFAULT_TAB_ID) {
      return resetFilterCollectionToState(DEFAULT_TAB_IDX);
    }
    return resetThenSetFilterCollectionToState(
      DEFAULT_TAB_IDX,
      tabIDToIdx.get(tabID)
    );
  };

  const feedAndTabs = () => (
    <div className="feed-container">
      {useTabs ? (
        <Tabs
          tabFilter={filterOptions[DEFAULT_TAB_IDX]}
          setTabFilter={setTab}
        />
      ) : null}
      <Results
        results={results}
        hasMore={hasMore}
        fetchMore={fetchMore}
        tab={getTabFromTypeFilterCollection(filterOptions[DEFAULT_TAB_IDX])}
      />
    </div>
  );

  return useFilterSider ? (
    <>
      <div className="sider-layout">
        <FilterMenu
          options={filterOptions}
          updateFilterOption={updateFilterOptionToState}
          resetFilterCollection={resetFilterCollectionToState}
        />
      </div>
      <div className="content-layout">{feedAndTabs()}</div>
    </>
  ) : (
    feedAndTabs()
  );
}
FilterableResults.defaultProps = {
  limit: 10,
};

/**
 * Safely resets the enabled status of all options in a collection
 */
function resetFilterCollection(filterOptions, collectionIndex) {
  let updatedFilterOptions = filterOptions;
  filterOptions[collectionIndex].options.forEach((_, idx) => {
    updatedFilterOptions = update(updatedFilterOptions, {
      [collectionIndex]: {
        options: {
          [idx]: {
            enabled: {
              $set: false,
            },
          },
        },
      },
    });
  });
  return updatedFilterOptions;
}

function updateFilterOption(filterOptions, collectionIndex, optionIndex) {
  const updatedFilterOptions = update(filterOptions, {
    [collectionIndex]: {
      options: {
        [optionIndex]: {
          enabled: {
            $apply: (enabledStatus) => !enabledStatus,
          },
        },
      },
    },
  });
  return updatedFilterOptions;
}

function Tabs({tabFilter, setTabFilter}) {
  // const selectedTab = getTabFromTypeFilterCollection(tabFilter);
  const tabs = tabFilter.options.map((option) => (
    <button onClick={() => setTabFilter(option.data.id)} key={option.data.id}>
      {option.data.name}
    </button>
  ));
  tabs.unshift(
    <button onClick={() => setTabFilter(DEFAULT_TAB_ID)} key="defaultTab">
      Most Relevant
    </button>
  );
  return <div className="tabs">{tabs}</div>;
}

function Results({results, hasMore, fetchMore, tab}) {
  if (Array.isArray(results) && results.length > 0) {
    return (
      <ResultsList results={results} hasMore={hasMore} fetchMore={fetchMore} />
    );
  } else {
    console.log('no data returned');
    return <h3>{`Looks like there's nothing here!`}</h3>;
  }
}

/**
 * Determines which tab is currently selected.
 *
 * The filter options are used to manage the selected tab, as tabs are
 * essentially applying a filter over the types of the result set before
 * applying a view to that data.
 *
 * Only one type filter may be applied at a time, as only a single tab is
 * selected. If multiple filters are applied, or if no filters are applied, the
 * default tab (Most Relevant) is used.
 */
export function getTabFromTypeFilterCollection(filterCollection) {
  const enabledTypes = filterCollection.options.filter(
    (option) => option.enabled
  );
  if (enabledTypes.length === 1) {
    return enabledTypes[DEFAULT_TAB_IDX].data.id;
  }
  return 'default';
}
