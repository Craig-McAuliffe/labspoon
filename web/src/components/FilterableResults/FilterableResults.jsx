import React, {useState, useEffect, useContext, createContext} from 'react';
import {useLocation} from 'react-router-dom';
import SearchBar from '../SearchBar';
import update from 'immutability-helper';
import {FilterMenu} from '../Filter/Filter';
import ResultsList from '../Results/Results';

import './FilterableResults.css';

export const FilterableResultsContext = createContext({});
export const FilterManagerContext = createContext({});

// Handles retrieval of data subject to a filter, and renders this into a result
// component.
//
// One of its children must be a filter component that is a consumer of the
// FilterableResultsContext, and calls the context setFilter function when
// its values are changed.
//
// Another of its children must be a results component that is a consumer of the
// FilterableResultsContext, and uses its results values for rendering.
//
// limit is the number of results to return on each page
export default function FilterableResults({children, fetchResults, limit}) {
  const [filter, setFilter] = useState([]);
  const [loadingFilter, setLoadingFilter] = useState(true);
  const [results, setResults] = useState([]);
  // whether there are more results left to retrieve
  const [hasMore, setHasMore] = useState(false);
  // `last` is used by Cloud Firestore as a pagination cursor, it is the last
  // result returned by the previous query
  const [last, setLast] = useState();
  // `skip` is the number of results to skip, if this is used for pagination
  // instead of the last result
  const [skip, setSkip] = useState(0);
  // whether the next batch of results are loading
  const [loadingResults, setLoadingResults] = useState(false);
  // whether an error occurred retrieving the results
  const [resultsError, setResultsError] = useState();
  // used for discerning tab and page changes, ie. when the results need to be reloaded
  const [fetchResultsFunction, setFetchResultsFunction] = useState(
    () => fetchResults
  );
  if (fetchResultsFunction !== fetchResults) {
    setFetchResultsFunction(() => fetchResults);
    setSkip(0);
  }
  useEffect(() => {
    // wait until the filter is loaded to avoid an unnecessary reload of the results
    if (loadingFilter) return;
    setLoadingResults(true);
    Promise.resolve(fetchResultsFunction(0, limit + 1, filter, undefined)).then(
      (newResults) => {
        if (newResults === undefined) {
          setHasMore(false);
          setResults([]);
          setLoadingResults(false);
        } else {
          setHasMore(!(newResults.length <= limit));
          setResults(newResults.slice(0, limit));
          setLast(newResults[newResults.length - 1]);
          setSkip(limit);
          setLoadingResults(false);
        }
      }
    );
  }, [fetchResultsFunction, filter, limit, loadingFilter]);

  // fetches results by triggering an effect
  function fetchMore() {
    setLoadingResults(true);
    Promise.resolve(fetchResultsFunction(skip, limit + 1, filter, last))
      .then((newResults) => {
        setHasMore(!(newResults.length <= limit));
        setResults((results) => results.concat(newResults.slice(0, limit)));
        setLast(results[results.length - 1]);
        setSkip(skip + limit);
        setLoadingResults(false);
      })
      .catch((err) => {
        setResultsError(true);
        console.log(err);
      });
  }

  // when the filters or results fetch function are updated we want to
  // repopulate the feed
  useEffect(() => {
    setLast(undefined);
    setSkip(0);
  }, [filter, fetchResultsFunction]);

  return (
    <FilterableResultsContext.Provider
      value={{
        filter,
        setFilter,
        loadingFilter,
        setLoadingFilter,
        results,
        hasMore,
        fetchMore,
        loadingResults,
        resultsError,
      }}
    >
      {children}
    </FilterableResultsContext.Provider>
  );
}

export function FilterManager({children}) {
  const filterableResults = useContext(FilterableResultsContext);
  const [displayedTabFilter, setDisplayedTabFilter] = useState([]);
  const [displayedSiderFilter, setDisplayedSiderFilter] = useState([]);
  const [siderFilterLoading, setSiderFilterLoading] = useState(true);
  const [tabsFilterLoading, setTabsFilterLoading] = useState(true);

  useEffect(() => {
    const pageFilter = [...displayedTabFilter, ...displayedSiderFilter];
    filterableResults.setFilter(pageFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedTabFilter, displayedSiderFilter]);

  useEffect(() => {
    filterableResults.setLoadingFilter(true);
    if (tabsFilterLoading === false && siderFilterLoading === false) {
      filterableResults.setLoadingFilter(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsFilterLoading, siderFilterLoading]);

  return (
    <FilterManagerContext.Provider
      value={{
        displayedTabFilter,
        setDisplayedTabFilter,
        displayedSiderFilter,
        setDisplayedSiderFilter,
        setSiderFilterLoading,
        setTabsFilterLoading,
      }}
    >
      {children}
    </FilterManagerContext.Provider>
  );
}

export function NewFilterMenuWrapper({
  getDefaultFilter,
  radio,
  dependentOnTab,
}) {
  const filterableResults = useContext(FilterableResultsContext);
  const filterManager = useContext(FilterManagerContext);
  const siderFilter = filterManager.displayedSiderFilter;
  const setSiderFilter = filterManager.setDisplayedSiderFilter;
  const tabFilter = filterManager.displayedTabFilter;

  useEffect(() => {
    filterManager.setSiderFilterLoading(true);

    if (getDefaultFilter === undefined) {
      filterManager.setSiderFilterLoading(false);
    }
    if (getDefaultFilter) {
      if (!dependentOnTab) {
        Promise.resolve(getDefaultFilter())
          .then((defaultFilter) => {
            setSiderFilter(defaultFilter);
            filterManager.setSiderFilterLoading(false);
          })
          .catch((error) => console.log(error));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Fetch sider filter on tab change if dependentOnTab
  useEffect(() => {
    if (getDefaultFilter) {
      if (dependentOnTab) {
        filterManager.setSiderFilterLoading(true);
        if (filterManager.displayedTabFilter) {
          Promise.resolve(getDefaultFilter(tabFilter))
            .then((defaultFilter) => {
              setSiderFilter(defaultFilter);
              filterManager.setSiderFilterLoading(false);
            })
            .catch((error) => console.log(error));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFilter]);
  if (!siderFilter) return null;
  if (filterableResults.loadingFilter) return <h2>Loading...</h2>;

  return (
    <FilterMenu
      options={siderFilter}
      updateFilterOption={(collectionIndex, optionIndex) => {
        const updatedFilterOptions = updateFilterOption(
          siderFilter,
          collectionIndex,
          optionIndex,
          radio
        );
        setSiderFilter(updatedFilterOptions);
      }}
      resetFilterCollection={(collectionIndex) => {
        const updatedFilterOptions = resetFilterCollection(
          siderFilter,
          collectionIndex
        );
        setSiderFilter(updatedFilterOptions);
      }}
      radio={radio}
    />
  );
}

export function ResourceTabs({tabs, affectsFilter}) {
  const filterManager = useContext(FilterManagerContext);
  const setTabFilter = filterManager.setDisplayedTabFilter;
  const tabFilter = filterManager.displayedTabFilter;
  useEffect(() => {
    filterManager.setTabsFilterLoading(true);

    if (tabs === undefined) {
      filterManager.setTabsFilterLoading(false);
    }
    if (tabs) {
      setTabFilter(tabs);
      filterManager.setTabsFilterLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!tabFilter) return null;
  return (
    <Tabs
      tabFilter={tabFilter[0]}
      setTabFilter={(id) => {
        const reset = resetFilterCollection(tabFilter, 0);
        const updated = updateFilterOption(
          reset,
          0,
          // get the index of the enabled option
          reset[0].options.findIndex((el) => el.data.id === id)
        );
        setTabFilter(updated);
      }}
      affectsFilter={affectsFilter}
    />
  );
}

export function NewResultsWrapper() {
  const filterableResults = useContext(FilterableResultsContext);
  if (filterableResults.resultsError) return <h1>Error...</h1>;
  return (
    <>
      <Results
        results={filterableResults.results}
        hasMore={filterableResults.hasMore}
        fetchMore={filterableResults.fetchMore}
      />
      {filterableResults.loadingResults ? <h2>Loading...</h2> : null}
    </>
  );
}

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

function updateFilterOption(
  filterOptions,
  collectionIndex,
  optionIndex,
  radio
) {
  if (radio) {
    filterOptions[collectionIndex].options.forEach((filterOption) => {
      filterOption.enabled = false;
    });
  }
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

export function Tabs({tabFilter, setTabFilter, affectsFilter}) {
  const filterManager = useContext(FilterManagerContext);
  if (!tabFilter) return <div></div>;
  const selectedTabID = getActiveTabIDFromTypeFilterCollection(tabFilter);
  const tabs = tabFilter.options.map((option) => (
    <button
      onClick={() => {
        // If the filter changes on tab change, we should not fetch results
        // until the new filter is loaded
        if (affectsFilter) {
          filterManager.setSiderFilterLoading(true);
        }
        setTabFilter(option.data.id);
      }}
      key={option.data.id}
      className={
        option.data.id === selectedTabID
          ? 'feed-tab-active'
          : 'feed-tab-inactive'
      }
    >
      <h3>{option.data.name}</h3>
    </button>
  ));
  if (selectedTabID === 'default') setTabFilter(tabFilter.options[0].data.id);
  return (
    <div className="feed-tabs-container">
      <div className="feed-tabs-layout">{tabs}</div>
    </div>
  );
}

function Results({results, hasMore, fetchMore, activeTabID}) {
  const currentLocation = useLocation().pathname;
  if (Array.isArray(results) && results.length > 0) {
    return (
      <ResultsList
        results={results}
        hasMore={hasMore}
        fetchMore={fetchMore}
        activeTabID={activeTabID}
      />
    );
  } else {
    return currentLocation === '/' ? (
      <SearchBar bigSearchPrompt={true} />
    ) : (
      <h3>{`Looks like there's nothing here!`}</h3>
    );
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
export function getActiveTabIDFromTypeFilterCollection(filterCollection) {
  if (!filterCollection) return 'default';
  const enabledTypes = filterCollection.options.filter(
    (option) => option.enabled
  );
  if (enabledTypes.length === 1) {
    return enabledTypes[0].data.id;
  }
  return 'default';
}
