import React, {useState} from 'react';
import update from 'immutability-helper';

/**
 * Renders a filter and the provided results component.
*/
export default function FilterableResults({
  DisplayComponent,
  fetchResults,
  defaultFilter,
  limit
}) {
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [results, setResults] = useState(fetchResults(skip, limit, defaultFilter));
  /**
   * Filter options has the following structure:
   * [{
   *   collectionName: string,
   *   options: [
   *     {
   *       enabled: boolean,
   *       data: {
   *         id: string
   *         name: string
   *       }
   *     }, ...
   *   ],
   * }, ...]
   */
  const [filterOptions, setFilterOptions] = useState(defaultFilter);
  /**
   * Fetches the next page of results. Attempts to retrieve an extra result to
   * determine whether there are more results available.
  */
  function fetchMore() {
    const newResults = fetchResults(skip + limit, limit + 1, filterOptions);
    if (newResults.length <= limit) {
      setHasMore(false);
    }
    setResults(results.concat(newResults.slice(0, limit)));
    setSkip(skip + limit);
  };
  /**
   * Used by option components to update the filter when toggled.
  */
  function updateFilterOption(collectionIndex, optionIndex) {
    const updatedFilterOptions = update(
      filterOptions,
      {
        [collectionIndex]: {
          options: {
            [optionIndex]: {
              enabled: {
                $apply: (enabledStatus) => !enabledStatus
              }
            }
          }
        }
      }
    );
    const newResults = fetchResults(0, limit + 1, updatedFilterOptions);
    setHasMore(newResults.length <= limit);
    setResults(newResults.slice(0, limit));
    setFilterOptions(updatedFilterOptions);
    setSkip(0);
  };
  return <DisplayComponent
    results={results}
    hasMore={hasMore}
    fetchMore={fetchMore}
    filterOptions={filterOptions}
    updateFilterOption={updateFilterOption}
  />;
}
FilterableResults.defaultProps = {
  limit: 10,
}
