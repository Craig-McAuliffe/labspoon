import React, {useState, useEffect} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import {functions} from 'firebase';
import Results from '../Results/Results';
import {SmallPublicationListItem} from './PublicationListItem';

const getMicrosoftAcademicKnowledgeAPIPublications = functions().httpsCallable(
  'publications-microsoftAcademicKnowledgePublicationSearch'
);

// Fully fledged search results for use on the search page.
export function MicrosoftAcademicKnowledgeAPIPublicationResults({query}) {
  const [results, setResults] = useState([]);
  useEffect(() => microsoftPublicationSearch(query, setResults), [query]);
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
    <SmallPublicationListItem
      publication={publication}
      key={publication.id || publication.microsoftID}
    >
      <PrimaryButton onClick={() => setPublication(publication)} small>
        Select
      </PrimaryButton>
    </SmallPublicationListItem>
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
