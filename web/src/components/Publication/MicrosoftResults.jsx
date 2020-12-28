import React, {useState, useEffect, useContext} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import {functions} from 'firebase';
import Results from '../Results/Results';
import {SmallPublicationListItem} from './PublicationListItem';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './PublicationListItem.css';
import {dbPublicationToJSPublication} from '../../helpers/publications';
import {MicrosoftPublicationSearchCache} from '../../App';

const microsoftPublicationSearchCloudFunction = functions().httpsCallable(
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

      updateStateForResults(
        cachedValues.data.results,
        cachedValues.data.expression,
        offset,
        limit,
        setHasMore,
        setResults,
        setExpression,
        setOffset
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
      interpretDispatch
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, missedCache]);
  function fetchMore() {
    if (!missedCache) return;
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
      interpretDispatch
    );
  }
  return (
    <>
      <Results results={results} hasMore={hasMore} fetchMore={fetchMore} />
      {loading ? <LoadingSpinner /> : null}
    </>
  );
}

// Publication results for use in forms, such as the create publication post form.
export function FormPublicationResults({query, setPublication}) {
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
      if (error) setError(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );
  const fetchPageByOffset = (searchOffset) => {
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

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <h4>
        Something went wrong. Try a variation of your search or look for one of
        the authors instead.
      </h4>
    );
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
        <></>
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
  setLoading(true);
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
      setError(true);
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
    setResults([]);
    return;
  }

  setLoading(true);
  const params = {
    query: query,
    limit: limit,
    offset: 0,
  };
  const paramsString = paramsToString(params);
  const getPublications = () =>
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
        setError(true);
      })
      .finally(() => setLoading(false));
  if (interpretCache.has(paramsString)) {
    getPublications();
    return;
  }
  const apiCallTimeout = setTimeout(getPublications, 1400);
  return () => clearTimeout(apiCallTimeout);
}
