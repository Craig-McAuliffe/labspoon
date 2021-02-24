import React, {useState, useEffect, useContext} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import {functions} from '../../firebase';
import Results from '../Results/Results';
import {SmallPublicationListItem} from './PublicationListItem';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import {dbPublicationToJSPublication} from '../../helpers/publications';
import {MicrosoftPublicationSearchCache} from '../../App';
import './PublicationListItem.css';
import './MicrosoftResults.css';

const microsoftPublicationSearchCloudFunction = functions.httpsCallable(
  'publications-microsoftAcademicKnowledgePublicationSearch'
);

const paramsToString = (params) =>
  `${params.query}_${params.expression}_${params.limit}_${params.offset}`;

async function getMicrosoftAcademicKnowledgeAPIPublications(
  params,
  cache,
  cacheDispatch
) {
  const paramsString = paramsToString(params);
  if (cache.has(paramsString))
    return new Promise((resolve) => {
      resolve(cache.get(paramsString));
    });
  params.limit = params.limit + 1;
  const resp = await microsoftPublicationSearchCloudFunction(params);
  cacheDispatch({args: paramsString, results: resp});
  return resp;
}

function updateStateForCachedResults(
  newResults,
  expression,
  setHasMore,
  setResults,
  setExpression,
  setOffset,
  setMissedCache
) {
  setHasMore(true);
  const mappedNewResults = newResults.map(dbPublicationToJSPublication);
  setResults(mappedNewResults);
  setExpression(expression);
  setOffset(newResults.length);
  setMissedCache(true);
}

function updateStateForResults(
  newResults,
  expression,
  offset,
  limit,
  setHasMore,
  setResults,
  setExpression,
  setOffset
) {
  setHasMore(!(newResults.length <= limit));
  const mappedNewResults = newResults
    .slice(0, limit)
    .map(dbPublicationToJSPublication);
  setResults((results) => results.concat(mappedNewResults));
  setExpression(expression);
  setOffset(offset + limit);
}

// Fully fledged search results for use on the search page.
export function MicrosoftAcademicKnowledgeAPIPublicationResults({query}) {
  const limit = 10;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expression, setExpression] = useState();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const [missedCache, setMissedCache] = useState(false);
  const {interpretCache, interpretDispatch} = useContext(
    MicrosoftPublicationSearchCache
  );

  useEffect(() => {
    const paramsString = paramsToString({
      query: query,
      expression: expression,
      limit: limit,
      offset: offset,
    });
    if (interpretCache.has(paramsString)) {
      setMissedCache(false);
      const cachedValues = interpretCache.get(paramsString);

      updateStateForCachedResults(
        cachedValues.data.results,
        cachedValues.data.expression,
        setHasMore,
        setResults,
        setExpression,
        setOffset,
        setMissedCache
      );
      return;
    }
    setMissedCache(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, expression, limit, offset]);

  useEffect(() => {
    if (!missedCache || offset !== 0) return;
    // Clear the old results as they will no longer be relevant to the new search
    setResults([]);
    microsoftPublicationSearchByQuery(
      query,
      limit,
      setOffset,
      setResults,
      setLoading,
      setExpression,
      setHasMore,
      interpretCache,
      interpretDispatch,
      setError
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, missedCache]);
  function fetchMore() {
    if (!missedCache) {
      setMissedCache(true);
      return;
    }
    return microsoftPublicationSearchByExpression(
      query,
      expression,
      limit,
      offset,
      setOffset,
      setResults,
      setLoading,
      setExpression,
      setHasMore,
      interpretCache,
      interpretDispatch,
      setError
    );
  }
  if (error)
    return (
      <h4>
        Something went wrong. Try a variation of your search or look for one of
        the authors instead.
      </h4>
    );
  return (
    <>
      <Results results={results} hasMore={hasMore} fetchMore={fetchMore} />
      {loading ? <LoadingSpinner /> : null}
    </>
  );
}

// Publication results for use in forms, such as the create publication post form.
export function PublicationSearchAfterDelayAndResults({query, setPublication}) {
  const limit = 10;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expression, setExpression] = useState();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const {interpretCache, interpretDispatch} = useContext(
    MicrosoftPublicationSearchCache
  );
  useEffect(
    () => {
      query && query.length > 0 ? setLoading(true) : setLoading(false);
      const pubSearchAfterDelay = setTimeout(() => {
        setResults([]);
        if (error) setError(false);
        if (query && query.length > 0)
          microsoftPublicationSearchByQuery(
            query,
            limit,
            setOffset,
            setResults,
            setLoading,
            setExpression,
            setHasMore,
            interpretCache,
            interpretDispatch,
            setError
          );
      }, 1400);
      return () => clearTimeout(pubSearchAfterDelay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );
  const fetchPageByOffset = (searchOffset) => {
    setLoading(true);
    setResults([]);
    microsoftPublicationSearchByExpression(
      query,
      expression,
      limit,
      searchOffset,
      setOffset,
      setResults,
      setLoading,
      setExpression,
      setHasMore,
      interpretCache,
      interpretDispatch,
      setError
    );
  };

  if (loading)
    return (
      <div className="publication-search-loading-spinner-container">
        <LoadingSpinner />
        <p className="publication-search-loading-advice">
          If the search takes too long, try looking for the author name and
          scrolling through.
        </p>
      </div>
    );
  if (error)
    return (
      <h4>
        Something went wrong. Try a variation of your search or look for one of
        the authors instead.
      </h4>
    );

  if (query === undefined) {
    if (loading) setLoading(false);
    if (results.length > 0) setResults([]);
    return null;
  }

  if (query.length === 0) {
    if (loading) setLoading(false);
    if (results.length > 0) setResults([]);
    return null;
  }

  function previousOnClick() {
    if (offset < limit) return;
    // The offset is set at the next page start point
    // We therefore have to go back twice the limit to get to the start
    // point of the previous page
    const newOffset = offset - 2 * limit;
    fetchPageByOffset(newOffset);
  }

  function nextOnClick() {
    if (!hasMore) return;
    fetchPageByOffset(offset);
  }

  if (results.length === 0)
    return (
      <h4>
        We could not find any publications for that search term. Try a variation
        of your search or look for one of the authors instead.
      </h4>
    );
  const publicationResults = results.map((publication) => (
    <div
      key={publication.id || publication.microsoftID}
      className="form-publication-list-item-container"
    >
      <SmallPublicationListItem publication={publication} />
      <div className="form-publication-list-item-select-container">
        <PrimaryButton onClick={() => setPublication(publication)}>
          Select
        </PrimaryButton>
      </div>
    </div>
  ));
  return (
    <>
      {publicationResults}
      {offset - limit > 0 ? (
        <button
          type="button"
          onClick={previousOnClick}
          className="tertiary-button"
        >
          Previous Page
        </button>
      ) : (
        <></>
      )}
      {hasMore ? (
        <button type="button" onClick={nextOnClick} className="tertiary-button">
          Next Page
        </button>
      ) : (
        <span className="publication-search-no-more-results">
          No more results
        </span>
      )}
    </>
  );
}

function microsoftPublicationSearchByExpression(
  query,
  expression,
  limit,
  offset,
  setOffset,
  setResults,
  setLoading,
  setExpression,
  setHasMore,
  interpretCache,
  interpretDispatch,
  setError
) {
  return getMicrosoftAcademicKnowledgeAPIPublications(
    {
      query: query,
      expression: expression,
      offset: offset,
      limit: limit,
    },
    interpretCache,
    interpretDispatch
  )
    .then((res) => {
      updateStateForResults(
        res.data.results,
        res.data.expression,
        offset,
        limit,
        setHasMore,
        setResults,
        setExpression,
        setOffset
      );
    })
    .catch((err) => {
      console.error(err);
      if (setError) setError(true);
    })
    .finally(() => setLoading(false));
}

// Retrieves publication results for a query with a time to prevent too many searches occuring during typing.
function microsoftPublicationSearchByQuery(
  query,
  limit,
  setOffset,
  setResults,
  setLoading,
  setExpression,
  setHasMore,
  interpretCache,
  interpretDispatch,
  setError
) {
  if (!query) {
    return;
  }
  setLoading(true);
  const params = {
    query: query,
    limit: limit,
    offset: 0,
  };
  getMicrosoftAcademicKnowledgeAPIPublications(
    params,
    interpretCache,
    interpretDispatch
  )
    .then((res) => {
      updateStateForResults(
        res.data.results,
        res.data.expression,
        0,
        limit,
        setHasMore,
        setResults,
        setExpression,
        setOffset
      );
    })
    .catch((err) => {
      console.error(err);
      if (setError) setError(true);
    })
    .finally(() => setLoading(false));
}

export function SearchPublicationsByAuthorID(authorID, setLoading) {
  const expression = `Composite(AA.AuId==${authorID})`;
  const limit = 20;

  microsoftPublicationSearchByExpression(
    query,
    expression,
    limit,
    searchOffset,
    setOffset,
    setResults,
    setLoading,
    setExpression,
    setHasMore,
    interpretCache,
    interpretDispatch,
    setError
  );
}
