import React, {useState, useEffect, useContext, createContext} from 'react';
import {Link, useLocation} from 'react-router-dom';
import SearchBar from '../SearchBar';
import update from 'immutability-helper';
import FilterMenu from '../Filter/Filter';
import ResultsList, {SelectableResults} from '../Results/Results';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './FilterableResults.css';
import LatestPosts from '../Posts/LatestPosts/LatestPosts';
import {getActiveTabID} from '../../helpers/filters';

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
  const [last, setLast] = useState(false);
  // `skip` is the number of results to skip, if this is used for pagination
  // instead of the last result
  const [skip, setSkip] = useState(0);
  // whether the next batch of results are loading
  const [loadingResults, setLoadingResults] = useState(false);
  // whether an error occurred retrieving the results
  const [resultsError, setResultsError] = useState('');
  // used for discerning tab and page changes, ie. when the results need to be reloaded
  const [fetchResultsFunction, setFetchResultsFunction] = useState(
    () => fetchResults
  );

  useEffect(() => {
    if (fetchResultsFunction !== fetchResults) {
      setFetchResultsFunction(() => fetchResults);
      setSkip(0);
    }
  }, [fetchResults]);

  useEffect(() => {
    // wait until the filter is loaded to avoid an unnecessary reload of the results
    if (loadingFilter) return;
    setLoadingResults(true);
    const [resultsPromise, errorMessage] = fetchResultsFunction(
      0,
      limit + 1,
      filter,
      undefined
    );
    if (errorMessage) {
      setResultsError(errorMessage);
    } else {
      setResultsError('');
    }
    Promise.resolve(resultsPromise).then((newResults) => {
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
    });
  }, [fetchResultsFunction, filter, limit, loadingFilter]);

  // fetches results by triggering an effect
  function fetchMore() {
    setLoadingResults(true);
    const [resultsPromise, errorMessage] = fetchResultsFunction(
      skip,
      limit + 1,
      filter,
      last
    );
    if (errorMessage) {
      setResultsError(errorMessage);
    } else {
      setResultsError('');
    }
    return Promise.resolve(resultsPromise)
      .then((newResults) => {
        setHasMore(!(newResults.length <= limit));
        const updatedResults = [...results, ...newResults.slice(0, limit)];
        setResults(updatedResults);
        setLast(updatedResults[updatedResults.length - 1]);
        setSkip(skip + limit);
        setLoadingResults(false);
      })
      .catch((err) => {
        setResultsError('Error getting results.');
        console.log(err);
      });
  }

  // when the filters, results, or tabs fetch function are updated we want to
  // repopulate the feed
  useEffect(() => {
    setLast(undefined);
    setSkip(0);
    setResults([]);
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
        setResults,
      }}
    >
      {children}
    </FilterableResultsContext.Provider>
  );
}
// combine tab filtering with sider filtering
export function FilterManager({
  children,
  fetchMoreSiderFilter,
  siderFilterOptionsLimit,
}) {
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

  const fetchMoreSiderFilterOptions = async (
    filterCollectionsIndex,
    filterCollectionResourceType,
    last
  ) => {
    if (!last || !filterCollectionResourceType || !filterCollectionsIndex)
      return;
    const {newOptions, hasMore} = await fetchMoreSiderFilter(
      filterCollectionResourceType,
      last
    );
    if (!newOptions || newOptions.length === 0) {
      setDisplayedSiderFilter((currentSiderFilter) => {
        const newSiderFilter = [...currentSiderFilter];
        newSiderFilter[filterCollectionsIndex].hasMore = false;
        return newSiderFilter;
      });
      return;
    }

    setDisplayedSiderFilter((currentSiderFilter) => {
      const newSiderFilter = [...currentSiderFilter];
      if (!hasMore) newSiderFilter[filterCollectionsIndex].hasMore = false;
      newOptions.forEach((newOption) => {
        newSiderFilter[filterCollectionsIndex].options.push(newOption);
      });
      return newSiderFilter;
    });
  };

  return (
    <FilterManagerContext.Provider
      value={{
        displayedTabFilter,
        setDisplayedTabFilter,
        displayedSiderFilter,
        setDisplayedSiderFilter,
        setSiderFilterLoading,
        setTabsFilterLoading,
        fetchMoreSiderFilter: fetchMoreSiderFilterOptions,
        siderFilterOptionsLimit: siderFilterOptionsLimit,
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
    if (!getDefaultFilter) {
      filterManager.setSiderFilterLoading(false);
      return;
    }
    if (!dependentOnTab) {
      Promise.resolve(getDefaultFilter())
        .then((defaultFilter) => {
          setSiderFilter(defaultFilter);
          filterManager.setSiderFilterLoading(false);
        })
        .catch((error) => console.log(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Fetch sider filter on tab change if dependentOnTab
  useEffect(() => {
    if (getDefaultFilter) {
      if (dependentOnTab) {
        filterManager.setSiderFilterLoading(true);
        if (tabFilter) {
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
  if (!getDefaultFilter) return null;
  if (filterableResults.loadingFilter) return <LoadingSpinner />;
  return (
    <FilterMenu
      filterCollectionsWithOptions={siderFilter}
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

export function ResourceTabs({
  tabs,
  affectsFilter,
  routedTabBasePathname,
  useRoutedTabs,
}) {
  const filterManager = useContext(FilterManagerContext);
  const setTabFilter = filterManager.setDisplayedTabFilter;
  const tabFilter = filterManager.displayedTabFilter;
  const setTabsFilterLoading = filterManager.setTabsFilterLoading;
  useEffect(() => {
    setTabsFilterLoading(true);
    if (tabs === undefined) {
      setTabsFilterLoading(false);
    }
    if (tabs) {
      setTabFilter(tabs);
      setTabsFilterLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  return (
    <Tabs
      routedTabBasePathname={routedTabBasePathname}
      useRoutedTabs={useRoutedTabs}
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

export function NewResultsWrapper({isFollowsPageResults}) {
  const filterableResults = useContext(FilterableResultsContext);
  if (filterableResults.resultsError)
    return (
      <h2 className="filterable-results-results-error">
        {filterableResults.resultsError}
      </h2>
    );
  const activeTabID = getActiveTabID(filterableResults.filter);
  return (
    <>
      <Results
        results={filterableResults.results}
        hasMore={filterableResults.hasMore}
        fetchMore={filterableResults.fetchMore}
        activeTabID={activeTabID}
        isFollowsPageResults={isFollowsPageResults}
      />
      {filterableResults.loadingResults ? <LoadingSpinner /> : null}
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

export function Tabs({
  tabFilter,
  setTabFilter,
  affectsFilter,
  routedTabBasePathname,
  useRoutedTabs,
}) {
  const filterManager = useContext(FilterManagerContext);
  const selectedTabID = getActiveTabIDFromTypeFilterCollection(tabFilter);

  useEffect(() => {
    if (!tabFilter) return;
    if (selectedTabID === 'default') setTabFilter(tabFilter.options[0].data.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFilter]);
  if (!tabFilter) return <div></div>;
  const tabs = tabFilter.options.map((option) => {
    return useRoutedTabs && option.data.id !== selectedTabID ? (
      <Link
        to={
          routedTabBasePathname
            ? `${routedTabBasePathname}/${option.data.id}`
            : `${option.data.id}`
        }
        key={option.data.id}
        className={
          option.data.id === selectedTabID
            ? 'feed-tab-active'
            : 'feed-tab-inactive'
        }
      >
        <h3>{option.data.name}</h3>
      </Link>
    ) : (
      <button
        onClick={() => {
          if (option.data.id === selectedTabID) return;
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
    );
  });

  return (
    <div className="feed-tabs-container">
      <div className="feed-tabs-layout">{tabs}</div>
    </div>
  );
}

function Results({
  results,
  hasMore,
  fetchMore,
  activeTabID,
  isFollowsPageResults,
}) {
  const currentLocation = useLocation().pathname;
  const filterableResults = useContext(FilterableResultsContext);
  const loading = filterableResults.loadingResults;
  if (Array.isArray(results) && results.length > 0) {
    return (
      <ResultsList
        results={results}
        hasMore={hasMore}
        fetchMore={fetchMore}
        activeTabID={activeTabID}
        isFollowsPageResults={isFollowsPageResults}
      />
    );
  } else {
    if (loading) return null;
    return currentLocation === '/' ? (
      <>
        <SearchBar bigSearchPrompt={true} />
        <LatestPosts />
      </>
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

export function FilteredSelectorManager({
  selectedItems,
  setSelectedItems,
  customEndMessage,
}) {
  const filterableResults = useContext(FilterableResultsContext);
  const results = filterableResults.results;
  const hasMore = filterableResults.hasMore;
  const fetchMore = filterableResults.fetchMore;
  const loading = filterableResults.loadingResults;
  return (
    <SelectableResults
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      customEndMessage={customEndMessage}
      results={results}
      hasMore={hasMore}
      fetchMore={fetchMore}
      loading={loading}
    />
  );
}
