import React from 'react';
import FilterableResults, {
  FilterManager,
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
} from '../../components/FilterableResults/FilterableResults';
import {UnpaddedPageContainer} from '../../components/Layout/Content';

export default function ResourcesFeed({children, fetchResults, limit, tabs}) {
  return (
    <FilterableResults fetchResults={fetchResults} limit={limit}>
      <FilterManager>
        <NewFilterMenuWrapper />
        <UnpaddedPageContainer>
          {children}
          <ResourceTabs tabs={tabs} />
          <NewResultsWrapper />
        </UnpaddedPageContainer>
      </FilterManager>
    </FilterableResults>
  );
}
