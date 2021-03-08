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
import {
  PaddedContent,
  UnpaddedPageContainer,
} from '../../components/Layout/Content';

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
    <UnpaddedPageContainer>
      <PaddedContent>
        <h2>Manage the things you follow here.</h2>
      </PaddedContent>
      <FilterableResults fetchResults={fetchFeedData} limit={10}>
        <div className="feed-container">
          <FilterManager>
            <ResourceTabs tabs={relationshipFilter} />
            <NewFilterMenuWrapper />
          </FilterManager>
          <NewResultsWrapper isFollowsPageResults={true} />
        </div>
      </FilterableResults>
    </UnpaddedPageContainer>
  );
};

function followsPageFeedDataFromDB(limit, filterOptions, last, userID) {
  const activeTab = getActiveTabID(filterOptions);
  switch (activeTab) {
    case 'people':
      const usersCollection = db.collection(`users/${userID}/followsUsers`);
      return [
        getPaginatedUserReferencesFromCollectionRef(
          usersCollection,
          limit,
          last,
          userID
        ),
        null,
      ];
    case 'groups':
      const groupsCollection = db
        .collection(`users/${userID}/followsGroups`)
        .orderBy('name');
      return [
        getPaginatedGroupReferencesFromCollectionRef(
          groupsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'topics':
      const topicsCollection = db
        .collection(`users/${userID}/followsTopics`)
        .orderBy('name');
      return [
        getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last),
        null,
      ];
    default:
      return [[], null];
  }
}

export default FollowsPage;
