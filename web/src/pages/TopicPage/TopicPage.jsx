import React, {useContext, useEffect, useState} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {FeatureFlags} from '../../App';
import {db} from '../../firebase';

import {getActiveTabID} from '../../helpers/filters';
import {getPaginatedPostsFromCollectionRef} from '../../helpers/posts';
import {getPaginatedPublicationsFromCollectionRef} from '../../helpers/publications';
import {getPaginatedUserReferencesFromCollectionRef} from '../../helpers/users';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';

import TopicListItem from '../../components/Topics/TopicListItem';
import FollowTopicButton from '../../components/Topics/FollowTopicButton';
import FilterableResults, {
  NewResultsWrapper,
  ResourceTabs,
  FilterManager,
  NewFilterMenuWrapper,
} from '../../components/FilterableResults/FilterableResults';
import TopicPageSider from './TopicPageSider';

import './TopicPage.css';
import MAGRouterDisplay from '../../components/MAGRouter';

async function fetchTopicDetailsFromDB(topicID) {
  return db
    .doc(`topics/${topicID}`)
    .get()
    .then((topicDetails) => {
      const data = topicDetails.data();
      data.id = topicID;
      return data;
    })
    .catch((err) => console.log(err));
}

function topicPageFeedDataFromDB(skip, limit, filterOptions, topicID, last) {
  const activeTab = getActiveTabID(filterOptions);
  let results = [];
  switch (activeTab) {
    case 'posts':
      const postsCollection = db
        .collection(`topics/${topicID}/posts`)
        .orderBy('timestamp', 'desc');
      return [
        getPaginatedPostsFromCollectionRef(postsCollection, limit, last),
        null,
      ];
    case 'publications':
      const publicationsCollection = db.collection(
        `topics/${topicID}/publications`
      );
      return [
        getPaginatedPublicationsFromCollectionRef(
          publicationsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'researchers':
      const usersCollection = db.collection(`topics/${topicID}/users`);
      return [
        getPaginatedUserReferencesFromCollectionRef(
          usersCollection,
          limit,
          last
        ),
        null,
      ];
    case 'groups':
      const groupsCollection = db.collection(`topics/${topicID}/groups`);
      return [
        getPaginatedGroupReferencesFromCollectionRef(
          groupsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'overview':
      results = [];
      break;
    default:
      results = [];
  }
  return [results, null];
}

export default function TopicPage() {
  const featureFlags = useContext(FeatureFlags);
  const [topicID, setTopicID] = useState(undefined);
  const [topicDetails, setTopicDetails] = useState(undefined);
  const history = useHistory();

  const topicIDParam = useParams().topicID;
  if (topicID !== topicIDParam) {
    setTopicID(topicIDParam);
  }

  const fetchTopicDetails = () => fetchTopicDetailsFromDB(topicID);

  useEffect(() => {
    Promise.resolve(fetchTopicDetails())
      .then((topicDetails) => {
        if (!topicDetails) {
          history.push('/notfound');
        }
        setTopicDetails(topicDetails);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicID]);

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    topicPageFeedDataFromDB(skip, limit, filterOptions, topicID, last);

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'posts',
            name: 'Posts',
          },
        },
        {
          enabled: false,
          data: {
            id: 'publications',
            name: 'Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'researchers',
            name: 'Researchers',
          },
        },
        {
          enabled: false,
          data: {
            id: 'groups',
            name: 'Groups',
          },
        },
      ],

      mutable: false,
    },
  ];

  if (featureFlags.has('overview')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'overview',
        name: 'Overview',
      },
    });
  }

  return (
    <>
      {featureFlags.has('related-resources') ? (
        <SuggestedTopics topicDetails={topicDetails} />
      ) : (
        <></>
      )}
      <FilterableResults fetchResults={fetchFeedData} limit={10}>
        <FilterManager>
          <NewFilterMenuWrapper />
          <div className="content-layout">
            <div className="details-container">
              <TopicListItem topic={topicDetails} dedicatedPage={true}>
                <FollowTopicButton targetTopic={topicDetails} />
              </TopicListItem>
            </div>
            <div className="feed-container">
              <ResourceTabs tabs={relationshipFilter} />
              <NewResultsWrapper />
            </div>
          </div>
        </FilterManager>
      </FilterableResults>
    </>
  );
}

function SuggestedTopics({topicDetails}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">Similar Topics to this one</h3>
        <div className="suggested-resources-container">
          <TopicPageSider currentTopic={topicDetails} />
        </div>
      </div>
    </div>
  );
}

export function MAGFieldRouter() {
  const magFieldID = useParams().magFieldID;
  return (
    <MAGRouterDisplay
      query={db
        .collection('topics')
        .where('microsoftID', '==', magFieldID)
        .limit(1)}
      formatRedirectPath={(id) => `/topic/${id}`}
    />
  );
}
