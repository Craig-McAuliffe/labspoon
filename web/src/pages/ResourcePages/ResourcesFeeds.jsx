import React from 'react';
import FilterableResults, {
  FilterManager,
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
} from '../../components/FilterableResults/FilterableResults';
import {UnpaddedPageContainer} from '../../components/Layout/Content';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

export default function ResourcesFeed({
  children,
  fetchResults,
  limit,
  tabs,
  tabsLoading,
  routedTabBasePathname,
  useRoutedTabs,
  getCustomComponentAboveFeed,
}) {
  return (
    <FilterableResults fetchResults={fetchResults} limit={limit}>
      <FilterManager>
        <NewFilterMenuWrapper />
        <UnpaddedPageContainer>
          {children}
          {tabsLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ResourceTabs
                tabs={tabs}
                routedTabBasePathname={routedTabBasePathname}
                useRoutedTabs={useRoutedTabs}
              />
              {getCustomComponentAboveFeed && getCustomComponentAboveFeed()}
              <NewResultsWrapper />
            </>
          )}
        </UnpaddedPageContainer>
      </FilterManager>
    </FilterableResults>
  );
}
