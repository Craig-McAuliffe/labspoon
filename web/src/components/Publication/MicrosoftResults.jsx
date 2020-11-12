import React, {useState, useEffect} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import {functions} from 'firebase';
import Results from '../Results/Results';
import {SmallPublicationListItem} from './PublicationListItem';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './PublicationListItem.css';
import {dbPublicationToJSPublication} from '../../helpers/publications';
const getMicrosoftAcademicKnowledgeAPIPublications = functions().httpsCallable(
  'publications-microsoftAcademicKnowledgePublicationSearch'
);

// Fully fledged search results for use on the search page.
export function MicrosoftAcademicKnowledgeAPIPublicationResults({query}) {
  const limit = 10;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expression, setExpression] = useState();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    // Clear the old results as they will no longer be relevant to the new search
    setResults([]);
    microsoftPublicationSearchByQuery(
      query,
      limit,
      setOffset,
      setResults,
      setLoading,
      setExpression,
      setHasMore
    );
  }, [query]);
  function fetchMore() {
    return microsoftPublicationSearchByExpression(
      expression,
      limit,
      offset,
      setOffset,
      setResults,
      setLoading,
      setExpression,
      setHasMore
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
  useEffect(
    () =>
      microsoftPublicationSearchByQuery(
        query,
        limit,
        setOffset,
        setResults,
        setLoading,
        setExpression,
        setHasMore
      ),
    [query]
  );
  const fetchPageByOffset = (offset) => {
    setResults([]);
    microsoftPublicationSearchByExpression(
      expression,
      limit,
      offset,
      setOffset,
      setResults,
      setLoading,
      setExpression,
      setHasMore
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
    const newOffset = offset - limit;
    fetchPageByOffset(newOffset);
    setOffset(newOffset);
  }

  function nextOnClick() {
    if (!hasMore) return;
    const newOffset = offset + limit;
    fetchPageByOffset(newOffset);
    setOffset(newOffset);
  }

  if (loading) return <LoadingSpinner />;
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
      {offset - limit >= 0 ? (
        <button type="button" onClick={previousOnClick}>
          Previous Page
        </button>
      ) : (
        <></>
      )}
      {hasMore ? (
        <button type="button" onClick={nextOnClick}>
          Next Page
        </button>
      ) : (
        <></>
      )}
    </>
  );
}

function microsoftPublicationSearchByExpression(
  expression,
  limit,
  offset,
  setOffset,
  setResults,
  setLoading,
  setExpression,
  setHasMore
) {
  setLoading(true);
  return getMicrosoftAcademicKnowledgeAPIPublications({
    expression: expression,
    offset: offset,
    limit: limit + 1,
  })
    .then((res) => {
      const newResults = res.data.results;
      setHasMore(!(newResults.length <= limit));
      setResults((results) =>
        results.concat(
          newResults.slice(0, limit).map(dbPublicationToJSPublication)
        )
      );
      setExpression(res.data.expression);
      setOffset(offset + limit);
    })
    .catch((err) => {
      alert(err);
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
  setHasMore
) {
  if (!query) {
    setResults([]);
    return;
  }
  setLoading(true);
  const apiCallTimeout = setTimeout(
    () =>
      getMicrosoftAcademicKnowledgeAPIPublications({
        query: query,
        limit: limit + 1,
      })
        .then((res) => {
          const newResults = res.data.results;
          setHasMore(!(newResults.length <= limit));
          setResults(
            newResults.slice(0, limit).map(dbPublicationToJSPublication)
          );
          setExpression(res.data.expression);
          setOffset(limit);
        })
        .catch((err) => {
          alert(err);
        })
        .finally(() => setLoading(false)),
    1400
  );
  return () => clearTimeout(apiCallTimeout);
}
