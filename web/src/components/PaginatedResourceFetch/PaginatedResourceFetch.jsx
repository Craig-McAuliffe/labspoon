import React, {useState, useEffect} from 'react';
import {getPaginatedResourcesFromCollectionRef} from '../../helpers/resources';
import ErrorMessage from '../Forms/ErrorMessage';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {SelectableResults} from '../Results/Results';

export default function PaginatedResourceFetch({
  isSelectable,
  collectionRef,
  setSelectedItems,
  selectedItems,
  limit,
  resourceType,
  customEndMessage,
  initialResults,
  useSmallCheckBox,
  useSmallListItems,
  noDivider,
  rankByName,
  scrollableTarget,
}) {
  const [lastFetchedResource, setLastFetchedResource] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [results, setResults] = useState(initialResults ? initialResults : []);

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
        if (!fetchedResults || fetchedResults.length === 0) {
          setHasMore(false);
          setResults([]);
          return;
        }
        setLastFetchedResource(fetchedResults[limit - 1]);
        if (fetchedResults.length < limit) setHasMore(false);
        const uniqueNewResults = fetchedResults.slice(0, limit);
        setResults((currentResults) => [
          ...currentResults,
          ...uniqueNewResults,
        ]);
      })
      .catch((err) => {
        console.error(`unable to fetch ${resourceType} ${err}`);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setResults([]);
    if (error) setError(false);
    if (!hasMore) setHasMore(true);
    if (lastFetchedResource) setLastFetchedResource(false);
    fetchTargetUserTopics();
  }, [collectionRef]);

  if (loading) return <LoadingSpinner />;
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
      />
    );
}
