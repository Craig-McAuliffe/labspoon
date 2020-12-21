import React from 'react';
import FilterableResults, {
  FilterManager,
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
} from '../../components/FilterableResults/FilterableResults';
import {FeedContent} from '../../components/Layout/Content';

export default function ResourcesFeed({children, fetchResults, limit, tabs}) {
  return (
    <FilterableResults fetchResults={fetchResults} limit={limit}>
      <FilterManager>
        <NewFilterMenuWrapper />
        <FeedContent>
          {children}
          <ResourceTabs tabs={tabs} />
          <NewResultsWrapper />
        </FeedContent>
      </FilterManager>
    </FilterableResults>
  );
}
