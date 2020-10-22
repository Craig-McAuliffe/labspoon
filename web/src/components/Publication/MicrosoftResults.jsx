import React, {useState, useEffect} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import {functions} from 'firebase';
import Results from '../Results/Results';
import {SmallPublicationListItem} from './PublicationListItem';

import './PublicationListItem.css';
const getMicrosoftAcademicKnowledgeAPIPublications = functions().httpsCallable(
  'publications-microsoftAcademicKnowledgePublicationSearch'
);

// Fully fledged search results for use on the search page.
export function MicrosoftAcademicKnowledgeAPIPublicationResults({query}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => microsoftPublicationSearch(query, setResults, setLoading), [
    query,
  ]);
  if (loading) return <h1>Loading...</h1>;
  return <Results results={results} hasMore={false} />;
}

// Publication results for use
export function FormPublicationResults({query, setPublication}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => microsoftPublicationSearch(query, setResults, setLoading), [
    query,
  ]);
  if (loading) return <h1>Loading...</h1>;
  return results.map((publication) => (
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
}

// Retrieves publication results for a query with a time to prevent too many searches occuring during typing.
function microsoftPublicationSearch(query, setResults, setLoading) {
  if (!query) return;
  setLoading(true);
  const apiCallTimeout = setTimeout(
    () =>
      getMicrosoftAcademicKnowledgeAPIPublications({
        query: query,
      })
        .then((res) => {
          setResults(res.data.map(toLocalPublication));
          setLoading(false);
        })
        .catch((err) => alert(err)),
    2000
  );
  return () => clearTimeout(apiCallTimeout);
}

function toLocalPublication(remotePublication) {
  remotePublication.resourceType = 'publication';
  return remotePublication;
}
