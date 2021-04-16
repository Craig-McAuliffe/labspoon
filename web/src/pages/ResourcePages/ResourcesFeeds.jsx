import React from 'react';
import FilterableResults, {
  FilterManager,
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
} from '../../components/FilterableResults/FilterableResults';
import {UnpaddedPageContainer} from '../../components/Layout/Content';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {GroupOverviewPage} from './GroupPage/GroupPage';

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
  displayOverviewPage,
  resourceID,
  resourceData,
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
              {displayOverviewPage && (
                <GroupOverviewPage
                  groupID={resourceID}
                  groupData={resourceData}
                  backgroundShade={backgroundShade}
                />
              )}
              <NewResultsWrapper />
            </>
          )}
        </UnpaddedPageContainer>
      </FilterManager>
    </FilterableResults>
  );
}
