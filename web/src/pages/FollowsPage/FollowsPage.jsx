import React, {useContext} from 'react';
import {db} from '../../firebase';
import {AuthContext} from '../../App';
import {getActiveTabID} from '../../helpers/filters';
import {getPaginatedUserReferencesFromCollectionRef} from '../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../helpers/topics';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';

import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  NewFilterMenuWrapper,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';

const FollowsPage = () => {
  const {user} = useContext(AuthContext);
  const userID = user.uid;

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    followsPageFeedDataFromDB(limit, filterOptions, last, userID);

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
          <FilterManager>
            <ResourceTabs tabs={relationshipFilter} />
            <NewFilterMenuWrapper />
          </FilterManager>
          <NewResultsWrapper />
        </div>
      </FilterableResults>
    </div>
  );
};

function followsPageFeedDataFromDB(limit, filterOptions, last, userID) {
  const activeTab = getActiveTabID(filterOptions);
  switch (activeTab) {
    case 'people':
      const usersCollection = db.collection(`users/${userID}/followsUsers`);
      return getPaginatedUserReferencesFromCollectionRef(
        usersCollection,
        limit,
        last
      );
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
      return [];
  }
}

export default FollowsPage;
