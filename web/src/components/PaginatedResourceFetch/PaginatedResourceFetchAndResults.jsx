import React, {useState, useEffect} from 'react';
import {getPaginatedResourcesFromCollectionRef} from '../../helpers/resources';
import TertiaryButton from '../Buttons/TertiaryButton';
import ErrorMessage from '../Forms/ErrorMessage';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {GenericListItem, SelectableResults} from '../Results/Results';
import './PaginatedResourceFetchAndResults.css';

export function SelectablePaginatedResourceFetchAndResults({
  isSelectable,
  collectionRef,
  setSelectedItems,
  selectedItems,
  limit,
  resourceType,
  customEndMessage,
  useSmallCheckBox,
  useSmallListItems,
  noDivider,
  rankByName,
  scrollableTarget,
  selectAllOption,
  results,
  setResults,
  selectedByDefault,
  backgroundShade,
}) {
  const [lastFetchedResource, setLastFetchedResource] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTargetUserTopics = () => {
    setLoading(true);
    if (error) setError(false);
    getPaginatedResourcesFromCollectionRef(
      collectionRef,
      limit,
      lastFetchedResource,
      resourceType,
      rankByName
    )
      .then((fetchedResults) => {
        if (backgroundShade)
          fetchedResults.forEach(
            (res) => (res.backgroundShade = backgroundShade)
          );
        if (!fetchedResults || fetchedResults.length === 0) {
          setHasMore(false);
          return;
        }
        setLastFetchedResource(fetchedResults[limit - 1]);
        if (fetchedResults.length < limit) setHasMore(false);
        if (selectedByDefault)
          setSelectedItems((currentSelectedItems) => [
            ...currentSelectedItems,
            ...fetchedResults.slice(0, limit - 1),
          ]);
        setResults((currentResults) => [
          ...currentResults,
          ...fetchedResults.slice(0, limit - 1),
        ]);
      })
      .catch((err) => {
        console.error(`unable to fetch ${resourceType} ${err}`);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTargetUserTopics();
  }, []);

  if (error)
    return <ErrorMessage noBorder={true}>Unable to fetch topics</ErrorMessage>;
  if (isSelectable)
    return (
      <SelectableResults
        setSelectedItems={setSelectedItems}
        selectedItems={selectedItems}
        results={results}
        hasMore={hasMore}
        fetchMore={fetchTargetUserTopics}
        loading={loading}
        error={error}
        useSmallListItems={useSmallListItems}
        useSmallCheckBox={useSmallCheckBox}
        customEndMessage={customEndMessage}
        noDivider={noDivider}
        scrollableTarget={scrollableTarget}
        selectAllOption={selectAllOption}
      />
    );
  return results.map((result) => (
    <GenericListItem key={result.id} result={result} />
  ));
}

export function PaginatedFetchAndResults({
  collectionRef,
  limit,
  resourceType,
  rankByName,
  superCachedResults,
  setSuperCachedResults,
  backgroundShade,
  resetResults,
}) {
  const cachedResultsAndSearchResetObject = {
    results: [],
    skip: 0,
    hasMore: false,
    last: null,
  };
  const [lastFetchedResource, setLastFetchedResource] = useState(null);
  const [hasMore, setHasMore] = useState(
    superCachedResults ? superCachedResults.results : false
  );
  const [skip, setSkip] = useState(
    superCachedResults ? superCachedResults.skip : 0
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [results, setResults] = useState(
    superCachedResults ? superCachedResults.results : 0
  );
  const [cachedResults, setCachedResults] = useState(
    cachedResultsAndSearchResetObject
  );
  const fetchResults = (isReset) =>
    getPaginatedResourcesFromCollectionRef(
      collectionRef,
      limit + 1,
      isReset ? null : lastFetchedResource,
      resourceType,
      rankByName
    ).catch((err) => {
      console.error(err);
      setError(true);
      setLoading(false);
    });

  const getNewResults = async (isReset) => {
    const newResults = await fetchResults(isReset);
    if (!newResults) return;
    const activeCachedResults = superCachedResults
      ? superCachedResults.results
      : cachedResults.results;
    const activeSetCachedResults = setSuperCachedResults
      ? setSuperCachedResults
      : setCachedResults;
    handleFetchedResultsWithPagination(
      newResults,
      setResults,
      setHasMore,
      activeSetCachedResults,
      isReset ? cachedResultsAndSearchResetObject.results : activeCachedResults,
      limit,
      setSkip,
      setLastFetchedResource,
      isReset ? 0 : skip,
      undefined,
      backgroundShade
    );
    setLoading(false);
  };

  useEffect(async () => {
    if (!resetResults) return;
    if (setSuperCachedResults)
      setSuperCachedResults(cachedResultsAndSearchResetObject);
    setCachedResults(cachedResultsAndSearchResetObject);

    return getNewResults(true);
  }, [resetResults]);

  useEffect(async () => {
    if (results.length > 0) {
      setLoading(false);
      return;
    }
    return getNewResults();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorMessage noBorder={true}>
        Something went wrong. Try refreshing your page.
      </ErrorMessage>
    );
  return (
    <>
      {results.map((result) => (
        <GenericListItem result={result} key={result.id} />
      ))}
      <PaginatedPreviousNextSection
        setDisplayedResults={setResults}
        cachedResults={
          superCachedResults
            ? superCachedResults.results
            : cachedResults.results
        }
        skip={skip}
        limit={limit}
        setSkip={setSkip}
        fetchMore={getNewResults}
        loadingResults={loading}
        hasMore={hasMore}
        setCachedResults={
          setSuperCachedResults ? setSuperCachedResults : setCachedResults
        }
        displayedResults={results}
      />
    </>
  );
}

export function handleFetchedResultsWithPagination(
  newResults,
  setFetchedResults,
  setHasMore,
  setSuperCachedSearchAndResults,
  cachedResults,
  limit,
  setSkip,
  setLast,
  skip,
  search,
  backgroundShade
) {
  if (newResults.length <= limit) {
    setHasMore(false);
    if (setSkip) setSkip(() => skip + newResults.length);
    setFetchedResults(newResults);
    if (backgroundShade)
      newResults.forEach((newResult) => {
        newResult.backgroundShade = backgroundShade;
      });
    setSuperCachedSearchAndResults(() => {
      const newSuperCacheResults = {
        hasMore: false,
        results: [...cachedResults, ...newResults],
        search: search,
      };
      if (setSkip) newSuperCacheResults.skip = skip + newResults.length;
      if (setLast)
        newSuperCacheResults.last = newResults[newResults.length - 1];
      return newSuperCacheResults;
    });
    if (setLast) setLast(newResults[newResults.length]);
  } else {
    setHasMore(true);
    if (setSkip) setSkip(() => skip + limit);
    setFetchedResults(newResults.slice(0, limit));
    if (setLast) setLast(newResults[limit]);
    setSuperCachedSearchAndResults(() => {
      const newSuperCacheResults = {
        hasMore: true,
        results: [...cachedResults, ...newResults.slice(0, limit)],
        search: search,
      };
      if (setSkip) newSuperCacheResults.skip = skip + limit;
      if (setLast) newSuperCacheResults.last = newResults[limit - 1];
      return newSuperCacheResults;
    });
  }
}
// only fetch more function should change last
export function PaginatedPreviousNextSection({
  setDisplayedResults,
  cachedResults,
  skip,
  limit,
  setSkip,
  fetchMore,
  loadingResults,
  hasMore,
  setCachedResults,
  displayedResults,
}) {
  const pageLength = displayedResults.length;
  const handleNextPageClick = () => {
    if (cachedResults.length > skip) {
      const numberOfSurplusCachedResults = cachedResults.length - skip;
      const nextPageLength =
        numberOfSurplusCachedResults > limit
          ? limit
          : numberOfSurplusCachedResults;
      setDisplayedResults(() =>
        cachedResults.slice(skip, skip + nextPageLength)
      );
      setSkip(skip + nextPageLength);
      if (setCachedResults)
        setCachedResults((currentCachedResults) => {
          const newSuperCacheResults = {...currentCachedResults};
          newSuperCacheResults.skip = skip + nextPageLength;
          return newSuperCacheResults;
        });
    } else fetchMore();
  };

  const handlePreviousPageClick = () => {
    setDisplayedResults(() =>
      cachedResults.slice(skip - (pageLength + limit), skip - pageLength)
    );
    setSkip(skip - pageLength);
    if (setCachedResults)
      setCachedResults((currentCachedResults) => {
        const newSuperCacheResults = {...currentCachedResults};
        newSuperCacheResults.skip = skip - pageLength;
        return newSuperCacheResults;
      });
  };
  return (
    <div className="paginated-previous-next-container">
      {skip > limit && !loadingResults ? (
        <TertiaryButton onClick={handlePreviousPageClick}>
          Previous Page
        </TertiaryButton>
      ) : (
        <div></div>
      )}
      {(hasMore || cachedResults.length > skip) && !loadingResults && (
        <TertiaryButton onClick={handleNextPageClick}>Next Page</TertiaryButton>
      )}
    </div>
  );
}

export function populateResultsWithSuperCachedResults(
  superCachedSearchAndResults,
  setResults,
  limit
) {
  if (
    !superCachedSearchAndResults ||
    superCachedSearchAndResults.results.length === 0
  )
    return;
  if (superCachedSearchAndResults.results.length > limit) {
    const excessResults = superCachedSearchAndResults.skip % limit;
    const numberOfResultsOnPage = excessResults === 0 ? limit : excessResults;
    setResults(
      superCachedSearchAndResults.results.slice(
        superCachedSearchAndResults.skip - numberOfResultsOnPage,
        superCachedSearchAndResults.skip
      )
    );
  } else setResults(superCachedSearchAndResults.results);
}
