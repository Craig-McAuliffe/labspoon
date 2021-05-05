import React, {useContext} from 'react';
import {db} from '../../firebase';
import {AuthContext} from '../../App';
import FilterableResults, {
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';
import {LoadingSpinnerPage} from '../../components/LoadingSpinner/LoadingSpinner';
import {
  PaddedContent,
  UnpaddedPageContainer,
} from '../../components/Layout/Content';
import {
  fetchMoreOptionsFromFilterCollection,
  filterFeedData,
  getFiltersFromFilterCollection,
} from '../../components/Filter/Filter';
import CreateButton from '../../components/Buttons/CreateButton';
import './FollowingFeedPage.css';
import {Link} from 'react-router-dom';
function fetchUserFeedData(uuid, skip, limit, filter, last) {
  const collection = db.collection(`users/${uuid}/feeds/followingFeed/posts`);
  return filterFeedData(collection, skip, limit, filter, last);
}

function initialFetchUserFeedFilters(uuid) {
  const results = db
    .collection(`users/${uuid}/feeds/followingFeed/filterCollections`)
    .get()
    .then((fcqs) => getFiltersFromFilterCollection(fcqs))
    .catch((err) => console.log(err));
  return results;
}

export default function FollowingFeedPage() {
  const {user, authLoaded} = useContext(AuthContext);
  const getDefaultFilter = () => {
    if (!user) return [];
    return initialFetchUserFeedFilters(user.uid);
  };

  const fetchResults = (skip, limit, filter, last) => {
    if (!user) return [];
    return fetchUserFeedData(user.uid, skip, limit, filter, last);
  };

  const fetchMoreFilterOptions = (filterCollectionResourceType, last) =>
    fetchMoreOptionsFromFilterCollection(
      db.collection(
        `users/${user.uid}/feeds/followingFeed/filterCollections/${filterCollectionResourceType}/filterOptions`
      ),
      last
    );

  if (authLoaded === false) return <LoadingSpinnerPage />;
  return (
    <FilterableResults fetchResults={fetchResults} limit={10} loadingFilter>
      <FilterManager fetchMoreSiderFilter={fetchMoreFilterOptions}>
        <NewFilterMenuWrapper getDefaultFilter={getDefaultFilter} />
        <ResourceTabs />
      </FilterManager>
      <UnpaddedPageContainer>
        <PaddedContent>
          <FollowingFeedPageCreateSection />
        </PaddedContent>
        <NewResultsWrapper />
      </UnpaddedPageContainer>
    </FilterableResults>
  );
}

function FollowingFeedPageCreateSection() {
  return (
    <div className="follow-feed-page-create-section">
      <Link to="/create/post">
        <CreateButton text="Create" />
      </Link>
    </div>
  );
}
