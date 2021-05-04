import React, {useState, useEffect, useRef} from 'react';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import firebase from '../../firebase';
import TertiaryButton from '../Buttons/TertiaryButton';

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
  superCachedSearchAndResults,
  setSuperCachedSearchAndResults,
}) {
  const [typedTopic, setTypedTopic] = useState(
    superCachedSearchAndResults ? superCachedSearchAndResults.search : ''
  );
  const [skip, setSkip] = useState(
    superCachedSearchAndResults ? superCachedSearchAndResults.skip : 0
  );
  const [hasMore, setHasMore] = useState(
    superCachedSearchAndResults ? superCachedSearchAndResults.hasMore : false
  );
  const [cachedTopics, setCachedTopics] = useState(
    superCachedSearchAndResults ? superCachedSearchAndResults.results : []
  );

  // populate results with previous search cached results
  useEffect(() => {
    if (
      !superCachedSearchAndResults ||
      superCachedSearchAndResults.results.length === 0
    )
      return;

    if (superCachedSearchAndResults.results.length > limit)
      setFetchedTopics(superCachedSearchAndResults.results.slice(0, limit));
    else setFetchedTopics(superCachedSearchAndResults.results);
  }, []);
  const searchInputRef = useRef();
  const handleFetchedTopics = (fetchedTopics) => {
    if (fetchedTopics.length <= limit) {
      setHasMore(false);
      setSkip((currentSkip) => currentSkip + fetchedTopics.length);
      setFetchedTopics(fetchedTopics);
      setCachedTopics((currentCachedTopics) => [
        ...currentCachedTopics,
        ...fetchedTopics,
      ]);
      setSuperCachedSearchAndResults({
        hasMore: false,
        results: [...cachedTopics, ...fetchedTopics],
        search: typedTopic,
        skip: skip + fetchedTopics.length,
      });
    } else {
      setHasMore(true);
      setSkip((currentSkip) => currentSkip + limit);
      setFetchedTopics(fetchedTopics.slice(0, limit));
      setCachedTopics((currentCachedTopics) => [
        ...currentCachedTopics,
        ...fetchedTopics.slice(0, limit),
      ]);
      setSuperCachedSearchAndResults({
        hasMore: true,
        results: [...cachedTopics, ...fetchedTopics.slice(0, limit)],
        search: typedTopic,
        skip: skip + limit,
      });
    }
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
  const handleNextPageClick = () => {
    if (cachedTopics.length > skip) {
      setFetchedTopics(() => cachedTopics.slice(skip, skip + limit));
      setSkip(skip + limit);
    } else fetchTopics();
  };

  const handlePreviousPageClick = () => {
    setFetchedTopics(() => cachedTopics.slice(skip - 2 * limit, skip - limit));
    setSkip(skip - limit);
  };

  useEffect(() => {
    if (typedTopic.length === 0) {
      setFetchedTopics([]);
      setCachedTopics([]);
      setSuperCachedSearchAndResults({search: '', results: []});
      setLoading(false);
      setHasMore(false);
      setSkip(0);
      return;
    }
    if (cachedTopics.length === 0) {
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
      <div className="search-ms-fields-next-previous-container">
        {skip > limit ? (
          <TertiaryButton onClick={handlePreviousPageClick}>
            Previous Page
          </TertiaryButton>
        ) : (
          <div></div>
        )}
        {(hasMore || cachedTopics.length > skip) && (
          <TertiaryButton onClick={handleNextPageClick}>
            Next Page
          </TertiaryButton>
        )}
      </div>
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
