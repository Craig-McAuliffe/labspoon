import React, {useContext, useState} from 'react';
import {useRouteMatch, useHistory} from 'react-router-dom';
import {FeatureFlags} from '../../App';

import FilterableResults, {
  getActiveTabIDFromTypeFilterCollection,
  DEFAULT_TAB_IDX,
} from '../../components/FilterableResults/FilterableResults';

import getFilteredTestPosts from '../../mockdata/posts';
import {getSearchFilters} from '../../mockdata/filters';
import publications from '../../mockdata/publications';
import groups from '../../mockdata/groups';
import users from '../../mockdata/users';
import topics from '../../mockdata/topics';

function fetchResults(skip, limit, filter) {
  const type = getActiveTabIDFromTypeFilterCollection(filter[DEFAULT_TAB_IDX]);
  switch (type) {
    case 'mostRelevant':
      return [
        ...getFilteredTestPosts(filter).slice(skip, skip + limit),
        ...publications().slice(skip, skip + limit),
        ...users().slice(skip, skip + limit),
        ...groups().slice(skip, skip + limit),
      ];
    case 'publications':
      return publications().slice(skip, skip + limit);
    case 'posts':
      return getFilteredTestPosts(filter).slice(skip, skip + limit);
    case 'researchers':
      return users().slice(skip, skip + limit);
    case 'groups':
      return groups().slice(skip, skip + limit);
    case 'topics':
      return topics().slice(skip, skip + limit);
    default:
      return [];
  }
}

export default function SearchPage() {
  const featureFlags = useContext(FeatureFlags);
  const [query, setQuery] = useState(useRouteMatch().params.query);
  const getDefaultFilter = () => getSearchFilters(featureFlags);
  return (
    <>
      <SearchForm query={query} setQuery={setQuery} />
      <FilterableResults
        fetchResults={fetchResults}
        getDefaultFilter={getDefaultFilter}
        limit={5}
        useTabs={true}
        useFilterSider={true}
        resourceInfo={undefined}
      />
    </>
  );
}

function SearchForm({query, setQuery}) {
  const history = useHistory();
  const handleSubmit = (event) => {
    history.push('/search/' + query);
    event.preventDefault();
  };
  const onChange = (event) => {
    setQuery(event.target.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={query} onChange={onChange} />
      <input type="submit" value="Submit" />
    </form>
  );
}
