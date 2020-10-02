import React, {useContext} from 'react';
import {db} from '../../firebase';
import {FeatureFlags, AuthContext} from '../../App';
import {getActiveTabID} from '../../helpers/filters';
import {getPaginatedPostsFromCollectionRef} from '../../helpers/posts';
import {getPaginatedTopicsFromCollectionRef} from '../../helpers/topics';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';

import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
} from '../../components/FilterableResults/FilterableResults';

const FollowsPage = () => {
  const {user} = useContext(AuthContext);
  const featureFlags = useContext(FeatureFlags);
  const userID = user.uid;
  const fetchFeedData = (skip, limit, filterOptions, last) => {
    featureFlags.has('disable-cloud-firestore')
      ? () => []
      : followsPageFeedDataFromDB(skip, limit, filterOptions, last, userID);
  };

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'people',
            name: 'People',
          },
        },
        {
          enabled: false,
          data: {
            id: 'groups',
            name: 'Groups',
          },
        },
        {
          enabled: false,
          data: {
            id: 'topics',
            name: 'Topics',
          },
        },
      ],

      mutable: false,
    },
  ];

  return (
    <div className="content-layout">
      <div className="details-container">
        <h2>Manage that which you follow here.</h2>
      </div>
      <FilterableResults fetchResults={fetchFeedData} limit={10}>
        <div className="feed-container">
          <ResourceTabs tabs={relationshipFilter} />
          <NewResultsWrapper />
        </div>
      </FilterableResults>
    </div>
  );
};

function followsPageFeedDataFromDB(skip, limit, filterOptions, last, userID) {
  const activeTab = getActiveTabID(filterOptions);
  let results;
  switch (activeTab) {
    case 'people':
      const usersCollection = db
        .collection(`users/${userID}/followsUsers`)
        .orderBy('name');
      return getPaginatedPostsFromCollectionRef(usersCollection, limit, last);
    case 'groups':
      const groupsCollection = db
        .collection(`users/${userID}/followsGroups`)
        .orderBy('name');
      return getPaginatedGroupReferencesFromCollectionRef(
        groupsCollection,
        limit,
        last
      );
    case 'topics':
      const topicsCollection = db
        .collection(`users/${userID}/followsTopics`)
        .orderBy('name');
      return getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last);

    default:
      results = [];
  }
  return results;
}

export default FollowsPage;
