import React, {useEffect, useState, useContext} from 'react';
import {useParams, Redirect} from 'react-router-dom';
import {FeatureFlags, AuthContext} from '../../../App';
import {db} from '../../../firebase';
import {getActiveTabID} from '../../../helpers/filters';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../../helpers/topics';
import {getPaginatedPublicationsFromCollectionRef} from '../../../helpers/publications';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import {getPaginatedImagesFromCollectionRef} from '../../../helpers/images';
import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import GroupPageSider from './GroupPageSider';
import {getGroup} from '../../../helpers/groups';
import {getPaginatedVideosFromCollectionRef} from '../../../helpers/videos';
import {
  PHOTOS,
  VIDEOS,
  OPENPOSITIONS,
  RESEARCHFOCUSES,
  OPENPOSITION,
  RESEARCHFOCUS,
  TECHNIQUE,
  TECHNIQUES,
  PUBLICATIONS,
  POSTS,
  TOPICS,
  GROUPS,
} from '../../../helpers/resourceTypeDefinitions';
import ResourcesFeed from '../ResourcesFeeds';
import {PaddedContent} from '../../../components/Layout/Content';
import GroupDetails from './GroupDetails';

import './GroupPage.css';

function fetchGroupPageFeedFromDB(
  groupID,
  last,
  limit,
  filterOptions,
  skip,
  userIsMember
) {
  const activeTab = filterOptions ? getActiveTabID(filterOptions) : null;
  let results;
  switch (activeTab) {
    case 'overview':
      results = [];
      break;
    case 'posts':
      const postsCollection = db
        .collection(`groups/${groupID}/posts`)
        .orderBy('timestamp', 'desc');
      results = getPaginatedPostsFromCollectionRef(
        postsCollection,
        limit,
        last
      );
      break;
    case 'publications':
      const publicationsCollection = db.collection(
        `groups/${groupID}/publications`
      );
      results = getPaginatedPublicationsFromCollectionRef(
        publicationsCollection,
        limit,
        last
      );
      break;
    case 'members':
      const usersCollection = db.collection(`groups/${groupID}/members`);
      results = getPaginatedUserReferencesFromCollectionRef(
        usersCollection,
        limit,
        last
      );
      break;
    case 'topics':
      const topicsCollection = db.collection(`groups/${groupID}/topics`);
      results = getPaginatedTopicsFromCollectionRef(
        topicsCollection,
        limit,
        last,
        true
      );
      break;
    case PHOTOS:
      const photosCollection = db.collection(`groups/${groupID}/photos`);
      results = getPaginatedImagesFromCollectionRef(
        photosCollection,
        limit,
        last
      );
      break;
    case VIDEOS:
      const videosCollection = db.collection(`groups/${groupID}/videos`);
      results = getPaginatedVideosFromCollectionRef(
        videosCollection,
        limit,
        last
      );
      break;
    case OPENPOSITIONS:
      const openPositionsCollection = db.collection(
        `groups/${groupID}/openPositions`
      );

      results = getPaginatedResourcesFromCollectionRef(
        openPositionsCollection,
        limit,
        last,
        OPENPOSITION
      );
      break;
    case RESEARCHFOCUSES:
      const researchFocusesCollection = db.collection(
        `groups/${groupID}/${RESEARCHFOCUSES}`
      );

      results = getPaginatedResourcesFromCollectionRef(
        researchFocusesCollection,
        limit,
        last,
        RESEARCHFOCUS
      );
      break;
    case TECHNIQUES:
      const techniquesCollection = db.collection(
        `groups/${groupID}/techniques`
      );

      results = getPaginatedResourcesFromCollectionRef(
        techniquesCollection,
        limit,
        last,
        TECHNIQUE
      );
      break;
    case 'followedByUsers':
      const followersCollection = db.collection(
        `groups/${groupID}/followedByUsers`
      );
      results = getPaginatedUserReferencesFromCollectionRef(
        followersCollection,
        limit,
        last,
        true
      );
      break;
    default:
      results = [];
      break;
  }
  const pinOption = userIsMember
    ? {
        showPinOption: true,
        pinProfileCollection: GROUPS,
        pinProfileID: groupID,
      }
    : null;
  return [results, null, pinOption];
}

const checkIfTabsAreUsed = async (setUsedTabs, groupID) => {
  const confirmedUsedTabs = [];
  await db
    .collection(`groups/${groupID}/techniques`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(TECHNIQUES);
    })
    .catch((err) => console.error(err));
  await db
    .collection(`groups/${groupID}/openPositions`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(OPENPOSITIONS);
    })
    .catch((err) => console.error(err));
  await db
    .collection(`groups/${groupID}/photos`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(PHOTOS);
    })
    .catch((err) => console.error(err));
  await db
    .collection(`groups/${groupID}/videos`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(VIDEOS);
    })
    .catch((err) => console.error(err));
  await db
    .collection(`groups/${groupID}/topics`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push(TOPICS);
    })
    .catch((err) => console.error(err));
  await db
    .collection(`groups/${groupID}/followedByUsers`)
    .limit(1)
    .get()
    .then((qs) => {
      if (qs.empty) return;
      confirmedUsedTabs.push('followedByUsers');
    })
    .catch((err) => console.error(err));

  setUsedTabs({checked: true, tabs: confirmedUsedTabs});
};

export const PinnedItemChangeContext = React.createContext();
export default function GroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const [groupID, setGroupID] = useState(false);
  const [groupData, setGroupData] = useState(false);
  const [verified, setVerified] = useState(false);
  const [userIsMember, setUserIsMember] = useState(false);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [usedTabs, setUsedTabs] = useState({checked: false, tabs: []});
  const {user} = useContext(AuthContext);
  const params = useParams();
  const routedTabID = params.routedTabID;
  const groupIDParam = params.groupID;

  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }

  useEffect(() => {
    Promise.resolve(getGroup(groupID))
      .then((groupData) => {
        if (!groupData) {
          setGroupData(null);
        }
        setGroupData(groupData);
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupID]);

  useEffect(async () => {
    if (!groupID) return;
    await db
      .doc(`verifiedGroups/${groupID}`)
      .get()
      .then((ds) => setVerified(ds.exists))
      .catch((err) => console.error(err));

    await checkIfTabsAreUsed(setUsedTabs, groupID);
    if (tabsLoading) setTabsLoading(false);
  }, [groupID]);

  const fetchTabs = () => {
    if (usedTabs.checked !== true) return;
    const tabOptions = [
      {
        collectionName: 'Relationship Types',
        options: [
          {
            enabled: routedTabID === POSTS ? true : false,
            data: {
              id: POSTS,
              name: 'Posts',
            },
          },
          {
            enabled: routedTabID === PUBLICATIONS ? true : false,
            data: {
              id: PUBLICATIONS,
              name: 'Publications',
            },
          },
          {
            enabled: routedTabID === 'members' ? true : false,
            data: {
              id: 'members',
              name: 'Members',
            },
          },

          {
            enabled: routedTabID === RESEARCHFOCUSES ? true : false,
            data: {
              id: RESEARCHFOCUSES,
              name: 'Research Focuses',
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
        case PHOTOS:
          tabName = 'Photos';
          break;
        case VIDEOS:
          tabName = 'Videos';
          break;
        case TOPICS:
          tabName = 'Topics';
          break;
        case 'followedByUsers':
          tabName = 'Followed By';
          break;
        default:
          tabName = null;
      }
      if (!tabName) return;

      tabOptions[0].options.push({
        enabled: routedTabID === usedTabID ? true : false,
        data: {
          id: usedTabID,
          name: tabName,
        },
      });
    });
    return tabOptions;
  };

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchGroupPageFeedFromDB(
      groupID,
      last,
      limit,
      filterOptions,
      skip,
      userIsMember
    );

  if (user) {
    db.collection(`groups/${groupID}/members`)
      .where('id', '==', user.uid)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          setUserIsMember(true);
        } else setUserIsMember(false);
      })
      .catch((err) => console.error(err));
  }
  if (groupData === null) return <Redirect to="/notfound" />;
  return (
    <>
      {featureFlags.has('related-resources') ? (
        <SuggestedGroups groupData={groupData} />
      ) : (
        <></>
      )}
      <ResourcesFeed
        fetchResults={fetchFeedData}
        limit={9}
        tabs={fetchTabs()}
        tabsLoading={tabsLoading}
        // the route matched path is different if the url is extended changes
        routedTabBasePathname={`group/${groupID}`}
        useRoutedTabs={true}
        tabsDesign={groupData.navigationDisplayType}
      >
        <PaddedContent>
          <GroupDetails
            group={groupData}
            userIsMember={userIsMember}
            verified={verified}
            groupID={groupID}
            routedTabID={routedTabID}
          />
        </PaddedContent>
      </ResourcesFeed>
    </>
  );
}

function SuggestedGroups({groupData}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">Suggested Groups</h3>
        <div className="suggested-resources-container">
          <GroupPageSider group={groupData} />
        </div>
      </div>
    </div>
  );
}
