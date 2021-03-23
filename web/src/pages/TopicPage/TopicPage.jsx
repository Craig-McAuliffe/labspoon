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
import TopicPageSider from './TopicPageSider';
import MAGRouterDisplay from '../../components/MAGRouter';
import {
  OPENPOSITION,
  OPENPOSITIONS,
  RESEARCHFOCUSES,
  TECHNIQUE,
  TECHNIQUES,
  USERS,
} from '../../helpers/resourceTypeDefinitions';
import {getPaginatedResourcesFromCollectionRef} from '../../helpers/resources';
import ResourcesFeed from '../ResourcePages/ResourcesFeeds';
import {PaddedContent} from '../../components/Layout/Content';

import './TopicPage.css';

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
    case USERS:
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
    case OPENPOSITIONS:
      const openPositionsCollection = db.collection(
        `topics/${topicID}/openPositions`
      );
      return [
        getPaginatedResourcesFromCollectionRef(
          openPositionsCollection,
          limit,
          last,
          OPENPOSITION
        ),
        null,
      ];
    case TECHNIQUES:
      const techniquesCollection = db.collection(
        `topics/${topicID}/techniques`
      );
      return [
        getPaginatedResourcesFromCollectionRef(
          techniquesCollection,
          limit,
          last,
          TECHNIQUE
        ),
        null,
      ];
    case RESEARCHFOCUSES:
      const researchFocusesCollection = db.collection(
        `topics/${topicID}/researchFocuses`
      );
      return [
        getPaginatedResourcesFromCollectionRef(
          researchFocusesCollection,
          limit,
          last,
          TECHNIQUE
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

const checkIfTabsAreUsed = async (setUsedTabs, topicID) => {
  const confirmedUsedTabs = [];
  await db
    .collection(`topics/${topicID}/techniques`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(TECHNIQUES);
    })
    .catch((err) => console.error(err));
  await db
    .collection(`topics/${topicID}/openPositions`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(OPENPOSITIONS);
    })
    .catch((err) => console.error(err));

  await db
    .collection(`topics/${topicID}/researchFocuses`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(RESEARCHFOCUSES);
    })
    .catch((err) => console.error(err));
  setUsedTabs({checked: true, tabs: confirmedUsedTabs});
};

export default function TopicPage() {
  const featureFlags = useContext(FeatureFlags);
  const [topicID, setTopicID] = useState(undefined);
  const [topicDetails, setTopicDetails] = useState(undefined);
  const [usedTabs, setUsedTabs] = useState({checked: false, tabs: []});
  const [tabsLoading, setTabsLoading] = useState(true);
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

  useEffect(async () => {
    if (!topicID) return;
    await checkIfTabsAreUsed(setUsedTabs, topicID);
    if (tabsLoading) setTabsLoading(false);
  }, [topicID]);

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    topicPageFeedDataFromDB(skip, limit, filterOptions, topicID, last);

  const fetchTabs = () => {
    if (usedTabs.checked !== true) return;
    const tabOptions = [
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
              id: USERS,
              name: 'Users',
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

    usedTabs.tabs.forEach((usedTabID) => {
      let tabName;
      switch (usedTabID) {
        case TECHNIQUES:
          tabName = 'Techniques';
          break;
        case OPENPOSITIONS:
          tabName = 'Open Positions';
          break;
        case RESEARCHFOCUSES:
          tabName = 'Research Focuses';
          break;
        default:
          tabName = null;
      }
      if (!tabName) return;

      tabOptions[0].options.push({
        enabled: false,
        data: {
          id: usedTabID,
          name: tabName,
        },
      });
    });
    return tabOptions;
  };

  return (
    <>
      {featureFlags.has('related-resources') ? (
        <SuggestedTopics topicDetails={topicDetails} />
      ) : (
        <></>
      )}
      <ResourcesFeed
        fetchResults={fetchFeedData}
        limit={10}
        tabs={fetchTabs()}
        tabsLoading={tabsLoading}
      >
        <PaddedContent>
          <TopicListItem topic={topicDetails} dedicatedPage={true}>
            <FollowTopicButton targetTopic={topicDetails} />
          </TopicListItem>
        </PaddedContent>
      </ResourcesFeed>
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
