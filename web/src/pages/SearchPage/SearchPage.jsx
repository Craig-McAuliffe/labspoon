import React, {useState} from 'react';
import {useRouteMatch, useHistory} from 'react-router-dom';

import FilterableResults, {
  getTabFromTypeFilterCollection,
  DEFAULT_TAB_IDX,
} from '../../components/FilterableResults/FilterableResults';

import getFilteredTestPosts from '../../mockdata/posts';
import {getSearchFilters} from '../../mockdata/filters';

function fetchResults(skip, limit, filter) {
  const type = getTabFromTypeFilterCollection(filter[DEFAULT_TAB_IDX]);
  switch (type) {
    case 'posts':
      const repeatedTestPosts = getFilteredTestPosts(filter);
      return repeatedTestPosts.slice(skip, skip + limit);
    default:
      return [];
  }
}

const filterOptionsData = getSearchFilters();

export default function SearchPage() {
  const [query, setQuery] = useState(useRouteMatch().params.query);
  return (
    <>
      <SearchForm query={query} setQuery={setQuery} />
      <FilterableResults
        fetchResults={fetchResults}
        defaultFilter={filterOptionsData}
        limit={5}
        useTabs={true}
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
