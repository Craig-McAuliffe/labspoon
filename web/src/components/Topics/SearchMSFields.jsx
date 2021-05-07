import React, {useState, useEffect, useRef} from 'react';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import firebase from '../../firebase';
import {
  handleFetchedResultsWithPagination,
  populateResultsWithSuperCachedResults,
  PaginatedPreviousNextSection,
} from '../PaginatedResourceFetch/PaginatedResourceFetchAndResults';

import './SearchMSFields.css';

const topicSearch = firebase.functions().httpsCallable('topics-topicSearch');

export default function SearchMSFields({
  setFetchedTopics,
  placeholder,
  searchIcon,
  setLoading,
  limit,
  largeDesign,
  children,
  cachedSearchAndResults,
  setCachedSearchAndResults,
  loading,
  fetchedTopics,
}) {
  const [typedTopic, setTypedTopic] = useState(
    cachedSearchAndResults ? cachedSearchAndResults.search : ''
  );
  const [skip, setSkip] = useState(
    cachedSearchAndResults ? cachedSearchAndResults.skip : 0
  );
  const [hasMore, setHasMore] = useState(
    cachedSearchAndResults ? cachedSearchAndResults.hasMore : false
  );
  // populate results with previous search cached results
  useEffect(() => {
    populateResultsWithSuperCachedResults(
      cachedSearchAndResults,
      setFetchedTopics,
      limit
    );
  }, []);

  const searchInputRef = useRef();

  const handleFetchedTopics = (newTopics) => {
    handleFetchedResultsWithPagination(
      newTopics,
      setFetchedTopics,
      setHasMore,
      setCachedSearchAndResults,
      cachedSearchAndResults.results,
      limit,
      setSkip,
      undefined,
      skip,
      typedTopic
    );
  };

  const fetchTopics = () =>
    searchMicrosoftTopics(
      typedTopic,
      setLoading,
      handleFetchedTopics,
      limit + 1,
      900,
      skip
    );

  useEffect(() => {
    if (
      cachedSearchAndResults &&
      typedTopic === cachedSearchAndResults.search
    ) {
      setLoading(false);
      return;
    }
    setFetchedTopics([]);
    if (setCachedSearchAndResults)
      setCachedSearchAndResults({
        search: '',
        results: [],
        skip: 0,
        hasMore: false,
      });
    setLoading(false);
    setHasMore(false);
    setSkip(0);
    if (
      cachedSearchAndResults &&
      cachedSearchAndResults.results.length === 0 &&
      typedTopic.length > 0
    ) {
      return fetchTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedTopic]);

  return (
    <>
      <div
        className={`ms-fields-search-container${largeDesign ? '-large' : ''}`}
      >
        {searchIcon ? <SearchIconGrey /> : null}
        <input
          type="text"
          onChange={(e) => {
            setTypedTopic(e.target.value);
          }}
          placeholder={placeholder}
          ref={searchInputRef}
          value={typedTopic}
        />
        {typedTopic.length > 0 && (
          <button
            className="search-ms-fields-clear-search"
            onClick={() => clearSearchInput(searchInputRef, setTypedTopic)}
          >
            <RemoveIcon />
          </button>
        )}
      </div>
      {children}
      <PaginatedPreviousNextSection
        setDisplayedResults={setFetchedTopics}
        cachedResults={
          cachedSearchAndResults ? cachedSearchAndResults.results : []
        }
        skip={skip}
        limit={limit}
        setSkip={setSkip}
        fetchMore={fetchTopics}
        loadingResults={loading}
        hasMore={hasMore}
        setCachedResults={setCachedSearchAndResults}
        displayedResults={fetchedTopics}
      />
    </>
  );
}

// clearTimeout is called on unmount from useEffect hook
export const searchMicrosoftTopics = (
  query,
  setLoading,
  setFetchedTopics,
  limit,
  timeBeforeSearch = 900,
  skip
) => {
  setLoading(true);
  const apiCallTimeout = setTimeout(
    () =>
      topicSearch({topicQuery: query, limit: limit, skip: skip})
        .then((microsoftTopics) => {
          setLoading(false);
          setFetchedTopics(microsoftTopics.data);
        })
        .catch((err) => {
          setLoading(false);
          setFetchedTopics([]);
          console.error(err, 'could not search topics');
        }),
    timeBeforeSearch
  );
  return () => clearTimeout(apiCallTimeout);
};

function clearSearchInput(searchInputRef, setTypedTopic) {
  if (!searchInputRef || !searchInputRef.current) return;
  searchInputRef.current.value = '';
  setTypedTopic('');
}
