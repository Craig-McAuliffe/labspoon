import React, {useState, useEffect} from 'react';
import {getPaginatedResourcesFromCollectionRef} from '../../helpers/resources';
import ErrorMessage from '../Forms/ErrorMessage';
import {SelectableResults} from '../Results/Results';

export default function PaginatedResourceFetchAndResults({
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
}
