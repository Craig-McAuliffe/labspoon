import React, {useEffect, useState, useContext} from 'react';
import {useParams, Redirect, Link, useHistory} from 'react-router-dom';
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
  POST,
} from '../../../helpers/resourceTypeDefinitions';
import ResourcesFeed from '../ResourcesFeeds';
import {PaddedContent} from '../../../components/Layout/Content';
import GroupDetails from './GroupDetails';
import {DARK_NAME_SHADE, LIGHT_NAME_SHADE} from './EditGroupDisplay';

import './GroupPage.css';
import {getActiveTabIDFromTypeFilterCollection} from '../../../components/FilterableResults/FilterableResults';
import {ImagesSection} from '../../../components/Images/ImageListItem';
import ListItemTopics from '../../../components/ListItem/ListItemTopics';
import UserAvatar from '../../../components/Avatar/UserAvatar';
import {RichTextBody} from '../../../components/Article/Article';
import {NextPreviousInReelIcon} from '../../../assets/GeneralActionIcons';

const OVERVIEW = 'overview';
function fetchGroupPageFeedFromDB(
  groupID,
  last,
  limit,
  filterOptions,
  skip,
  userIsMember,
  backgroundShade
) {
  const activeTab = filterOptions ? getActiveTabID(filterOptions) : null;
  let results;
  switch (activeTab) {
    case 'overview':
      const newsCollection = db.collection(`groups/${groupID}/news`);
      results = getPaginatedResourcesFromCollectionRef(
        newsCollection,
        limit,
        last,
        POST
      );
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
  const resultParameters = {
    backgroundShade: backgroundShade,
  };
  if (userIsMember) {
    resultParameters.showPinOption = true;
    resultParameters.pinProfileCollection = GROUPS;
    resultParameters.pinProfileID = groupID;
    resultParameters.showNews = true;
    resultParameters.newsCollection = `groups/${groupID}/news`;
    resultParameters.userCanEdit = true;
  }

  return [results, null, resultParameters];
}

const checkIfTabsAreUsed = async (
  setUsedTabs,
  groupID,
  overviewPageIsDisplayed
) => {
  const confirmedUsedTabs = [];
  if (overviewPageIsDisplayed) confirmedUsedTabs.push(OVERVIEW);
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
    if (!groupData) return;
    await checkIfTabsAreUsed(
      setUsedTabs,
      groupID,
      groupData.isDisplayingOverviewPage
    );
    if (tabsLoading) setTabsLoading(false);
  }, [groupID, groupData]);

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
        case OVERVIEW:
          tabName = 'Overview';
          break;
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
      const getTabFilterObject = () => {
        return {
          enabled: routedTabID === usedTabID ? true : false,
          data: {
            id: usedTabID,
            name: tabName,
          },
        };
      };
      if (usedTabID === OVERVIEW)
        tabOptions[0].options.unshift(getTabFilterObject());
      else tabOptions[0].options.push(getTabFilterObject());
    });
    return tabOptions;
  };

  const fetchFeedData = (skip, limit, filterOptions, last) => {
    return fetchGroupPageFeedFromDB(
      groupID,
      last,
      limit,
      filterOptions,
      skip,
      userIsMember,
      backgroundShade
    );
  };
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
  const backgroundShade = getGroupBackgroundShadeFromBackgroundID(
    groupData.backgroundDesign
  );
  let displayOverviewPage = false;
  if (fetchTabs()) {
    displayOverviewPage =
      (getActiveTabIDFromTypeFilterCollection(fetchTabs()[0]) === 'default' &&
        groupData.isDisplayingOverviewPage) ||
      getActiveTabIDFromTypeFilterCollection(fetchTabs()[0]) === OVERVIEW;
  }
  return (
    <>
      {featureFlags.has('related-resources') ? (
        <SuggestedGroups groupData={groupData} />
      ) : (
        <></>
      )}
      <ResourcesFeed
        fetchResults={fetchFeedData}
        backgroundShade={backgroundShade}
        limit={9}
        tabs={fetchTabs()}
        tabsLoading={tabsLoading}
        // the route matched path is different if the url is extended changes
        routedTabBasePathname={`group/${groupID}`}
        useRoutedTabs={true}
        tabsDesign={groupData.navigationDisplayType}
        displayOverviewPage={displayOverviewPage}
        resourceID={groupID}
        resourceData={groupData}
      >
        <PaddedContent backgroundShade={backgroundShade}>
          <GroupDetails
            group={groupData}
            userIsMember={userIsMember}
            verified={groupData.isVerified}
            groupID={groupID}
            routedTabID={routedTabID}
            backgroundShade={backgroundShade}
          />
        </PaddedContent>
      </ResourcesFeed>
    </>
  );
}

export function GroupOverviewPage({groupData, groupID, backgroundShade}) {
  const [photoHighlights, setPhotoHighlights] = useState([]);
  const [loadingPhotoHighlights, setLoadingPhotoHighlights] = useState(true);

  const topTopics = [];
  let topicsSkipped = 0;
  if (groupData.isDisplayingTopTopics) {
    if (groupData.recentPostTopics)
      groupData.recentPostTopics.forEach((topic, i) => {
        if (i === 0) topicsSkipped = 0;
        if (i > 10 + topicsSkipped) return;
        if (topTopics.some((topTopic) => topTopic.id === topic.id)) {
          topicsSkipped = topicsSkipped + 1;
          return;
        }
        topTopics.push(topic);
      });
    if (groupData.recentPublicationTopics)
      groupData.recentPublicationTopics.forEach((topic, i) => {
        if (i === 0) topicsSkipped = 0;
        if (i > 10 + topicsSkipped) return;
        if (topTopics.some((topTopic) => topTopic.id === topic.id)) {
          topicsSkipped = topicsSkipped + 1;
          return;
        }
        topTopics.push(topic);
      });
    if (groupData.recentArticleTopics)
      groupData.recentArticleTopics.forEach((topic, i) => {
        if (i === 0) topicsSkipped = 0;
        if (i > 10 + topicsSkipped) return;
        if (topTopics.some((topTopic) => topTopic.id === topic.id)) {
          topicsSkipped = topicsSkipped + 1;
          return;
        }
        topTopics.push(topic);
      });
  }

  useEffect(async () => {
    if (!loadingPhotoHighlights) setLoadingPhotoHighlights(true);
    const fetchedPhotoHighlightsQS = await db
      .collection(`groups/${groupID}/photoHighlights`)
      .get()
      .catch((err) =>
        console.error(
          `unable to fetch photo highlights for group with id ${groupID} ${err}`
        )
      );
    if (!fetchedPhotoHighlightsQS || fetchedPhotoHighlightsQS.empty) {
      setLoadingPhotoHighlights(false);
      return;
    }
    fetchedPhotoHighlightsQS.forEach((ds) => {
      const photo = ds.data();
      setPhotoHighlights((currentPhotos) => [...currentPhotos, photo]);
    });
    setLoadingPhotoHighlights(false);
  }, [groupID]);

  return (
    <>
      {groupData.isDisplayingMemberReel && (
        <>
          <h3
            className={`group-page-overview-section-title-${
              backgroundShade ? backgroundShade : 'light'
            }`}
          >
            Member Reel
          </h3>
          <GroupMemberReel
            backgroundShade={backgroundShade}
            groupID={groupID}
          />
        </>
      )}
      {loadingPhotoHighlights && (
        <ImagesSection
          images={[{src: 'loading'}, {src: 'loading'}, {src: 'loading'}]}
          loading={true}
        />
      )}
      {photoHighlights.length > 0 && !loadingPhotoHighlights && (
        <>
          <h3
            className={`group-page-overview-section-title-${
              backgroundShade ? backgroundShade : 'light'
            }`}
          >
            Highlights
          </h3>
          <div
            className={`group-page-overview-section-container-${
              backgroundShade ? backgroundShade : 'light'
            }`}
          >
            <ImagesSection images={photoHighlights} />
          </div>
        </>
      )}
      {groupData.isDisplayingTopTopics && (
        <>
          <h3
            className={`group-page-overview-section-title-${
              backgroundShade ? backgroundShade : 'light'
            }`}
          >
            Top Topics
          </h3>
          <div
            className={`group-page-overview-section-container-${
              backgroundShade ? backgroundShade : 'light'
            }`}
          >
            <ListItemTopics
              backgroundShade={backgroundShade}
              dbTopics={topTopics}
              isTopTopics={true}
            />
          </div>
        </>
      )}
      <h3
        className={`group-page-overview-section-title-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        News
      </h3>
    </>
  );
}

const FORWARDS_CLICK_DIRECTION = 'forwards';
const BACKWARDS_CLICK_DIRECTION = 'backwards';
function GroupMemberReel({groupID, backgroundShade}) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [currentShownMember, setCurrentShownMember] = useState(false);
  const [clickDirection, setClickDirection] = useState(
    FORWARDS_CLICK_DIRECTION
  );
  const history = useHistory();
  useEffect(async () => {
    const membersQS = await db
      .collection(`groups/${groupID}/members`)
      .limit(40)
      .get()
      .catch((err) =>
        console.error(
          `unable to fetch members for group with id ${groupID} ${err}`
        )
      );
    if (!membersQS || membersQS.empty) {
      setLoadingMembers(false);
      return;
    }
    membersQS.forEach((fetchedMember) => {
      const fetchedMemberData = fetchedMember.data();
      fetchedMemberData.id = fetchedMember.id;
      setMembers((currentMembers) => [...currentMembers, fetchedMemberData]);
    });
    setLoadingMembers(false);
  }, [groupID]);

  useEffect(() => {
    if (!members) return;
    setCurrentShownMember(members[0]);
  }, [members]);

  const changeCurrentShownMember = (nextOrPrevious) => {
    const currentMemberIndex = members.indexOf(currentShownMember);
    if (nextOrPrevious === 'next') {
      const isFinal = currentMemberIndex === members.length - 1 ? true : false;
      if (isFinal) return setCurrentShownMember(members[0]);
      return setCurrentShownMember(members[currentMemberIndex + 1]);
    }
    if (nextOrPrevious === 'previous') {
      const isFirst = currentMemberIndex === 0 ? true : false;
      if (isFirst) return setCurrentShownMember(members[members.length - 1]);
      return setCurrentShownMember(members[currentMemberIndex - 1]);
    }
  };
  return (
    <div
      className={`group-page-overview-section-container-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      <div className="group-page-member-reel-avatar-container">
        <button
          className={`next-previous-member-reel-button-${
            backgroundShade ? backgroundShade : 'light'
          }`}
          onClick={() => {
            if (clickDirection !== BACKWARDS_CLICK_DIRECTION)
              setClickDirection(BACKWARDS_CLICK_DIRECTION);
            changeCurrentShownMember('previous');
          }}
        >
          <NextPreviousInReelIcon />
        </button>
        <button
          className="next-previous-member-reel-avatar-button"
          onClick={() => history.push(`/user/${currentShownMember.id}`)}
        >
          <div className={`match-avatar-height-width-${clickDirection}`}>
            <UserAvatar
              src={currentShownMember ? currentShownMember.avatar : undefined}
              loading={loadingMembers}
              key={currentShownMember ? currentShownMember.avatar : undefined}
            />
          </div>
        </button>
        <button
          className={`next-previous-member-reel-button-${
            backgroundShade ? backgroundShade : 'light'
          }`}
          onClick={() => {
            if (clickDirection !== FORWARDS_CLICK_DIRECTION)
              setClickDirection(FORWARDS_CLICK_DIRECTION);
            changeCurrentShownMember('next');
          }}
        >
          <NextPreviousInReelIcon isNext={true} />
        </button>
      </div>
      {currentShownMember && (
        <>
          <Link
            className={`group-page-overview-members-reel-name-${
              backgroundShade ? backgroundShade : 'light'
            }`}
            to={`user/${currentShownMember.id}`}
          >
            <h2>{currentShownMember.name}</h2>
          </Link>
          <h3
            className={`group-page-overview-members-reel-position-${
              backgroundShade ? backgroundShade : 'light'
            }`}
          >
            {currentShownMember.position}
          </h3>
          {currentShownMember.bio && (
            <>
              <h4 className={`group-page-overview-members-reel-sub-title`}>
                Member Bio
              </h4>
              <RichTextBody
                body={currentShownMember.bio}
                backgroundShade={backgroundShade}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export function getGroupBackgroundShadeFromBackgroundID(backgroundDesign) {
  if (backgroundDesign) {
    return backgroundDesign.toLowerCase().includes(DARK_NAME_SHADE)
      ? DARK_NAME_SHADE
      : LIGHT_NAME_SHADE;
  }
  return LIGHT_NAME_SHADE;
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
