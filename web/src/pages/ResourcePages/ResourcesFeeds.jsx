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
  tabsDesign,
  backgroundShade,
}) {
  return (
    <FilterableResults fetchResults={fetchResults} limit={limit}>
      <FilterManager>
        <NewFilterMenuWrapper />
        <UnpaddedPageContainer backgroundShade={backgroundShade}>
          {children}
          {tabsLoading ? (
            <div style={{marginTop: '20px'}}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <ResourceTabs
                tabs={tabs}
                routedTabBasePathname={routedTabBasePathname}
                useRoutedTabs={useRoutedTabs}
                tabsDesign={tabsDesign}
                backgroundShade={backgroundShade}
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
