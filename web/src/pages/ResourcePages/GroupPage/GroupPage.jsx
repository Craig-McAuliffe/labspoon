import React, {useRef, useEffect, useState, useContext} from 'react';
import {Link, useParams, useHistory} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';

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
import GroupAvatar from '../../../components/Avatar/GroupAvatar';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import MessageButton from '../../../components/Buttons/MessageButton';
import EditButton from '../../../components/Buttons/EditButton';
import SeeMore from '../../../components/SeeMore';
import {getGroup} from '../../../helpers/groups';
import {getPaginatedVideosFromCollectionRef} from '../../../helpers/videos';
import {WebsiteIcon} from '../../../assets/PostOptionalTagsIcons';
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

import './GroupPage.css';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {RichTextBody} from '../../../components/Article/Article';
import TertiaryButton from '../../../components/Buttons/TertiaryButton';
import UserCoverPhoto from '../../../components/User/UserCoverPhoto';
import {GenericListItem} from '../../../components/Results/Results';

function fetchGroupPageFeedFromDB(groupID, last, limit, filterOptions, skip) {
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
  return [
    results,
    null,
    {
      pinned: true,
      pinProfileTypePlural: GROUPS,
      pinProfileID: groupID,
    },
  ];
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

export default function GroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const [groupID, setGroupID] = useState(undefined);
  const [groupData, setGroupData] = useState(undefined);
  const [verified, setVerified] = useState(false);
  const [userIsMember, setUserIsMember] = useState(false);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [usedTabs, setUsedTabs] = useState({checked: false, tabs: []});
  const history = useHistory();
  const {user} = useContext(AuthContext);
  const params = useParams();
  const routedTabID = params.routedTabID;
  const groupIDParam = params.groupID;
  const groupDescriptionRef = useRef();

  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }

  useEffect(() => {
    Promise.resolve(getGroup(groupID))
      .then((groupData) => {
        if (!groupData) {
          history.push('/notfound');
        }
        setGroupData(groupData);
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupID]);

  useEffect(async () => {
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
    fetchGroupPageFeedFromDB(groupID, last, limit, filterOptions, skip);

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
        routedTabBasePathname={routedTabID ? undefined : `${groupID}`}
        useRoutedTabs={true}
      >
        <PaddedContent>
          <GroupDetails
            group={groupData}
            groupDescriptionRef={groupDescriptionRef}
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

const GROUP_DESCRIPTION_HEIGHT = 144;

const GroupDetails = ({
  group,
  groupDescriptionRef,
  userIsMember,
  verified,
  groupID,
  routedTabID,
}) => {
  const featureFlags = useContext(FeatureFlags);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [pinnedItem, setPinnedItem] = useState(null);

  useEffect(() => {
    if (!group) return;
    if (group.pinnedItem) setPinnedItem(group.pinnedItem);
  }, [groupID]);

  useEffect(() => {
    if (!groupID) return;
    const groupDocObserver = db
      .doc(`groups/${groupID}`)
      .onSnapshot((docSnapshot) => {
        const newGroupData = docSnapshot.data();
        setPinnedItem(newGroupData.pinnedItem);
      });
    return () => groupDocObserver();
  }, [groupID]);

  useEffect(() => {
    if (group && shouldRefresh) {
      setShouldRefresh(false);
      return;
    }
    const refreshAdviceTimer = setTimeout(() => {
      if (group) return;
      setShouldRefresh(true);
    }, 8000);
    return () => {
      clearTimeout(refreshAdviceTimer);
    };
  }, [group, shouldRefresh]);

  if (group === undefined)
    return (
      <div className="group-header">
        <div className="group-page-details-loading"></div>
        <div className="group-page-details-loading">
          <LoadingSpinner />
          {shouldRefresh && (
            <p>
              This is taking a while... try{' '}
              <TertiaryButton onClick={() => window.location.reload()}>
                refreshing the page
              </TertiaryButton>
            </p>
          )}
        </div>
      </div>
    );

  return (
    <>
      <div className="group-header">
        <div className="group-icon-and-message">
          <div className="group-avatar-positioning">
            <GroupAvatar src={group.avatar} height="160" width="160" />
          </div>
          {featureFlags.has('group-message-button') ? <MessageButton /> : null}
        </div>
        <div className="group-header-info">
          <div className="group-header-name-insitution">
            <h2>{group.name}</h2>
            <h4>{group.institution}</h4>
          </div>
        </div>
      </div>
      <div className="group-cover-photo-container">
        <UserCoverPhoto
          src={group.coverPhoto}
          alt={`group cover picture`}
          isGroup={true}
        />
      </div>
      <div className="group-email-follow-container">
        <WebsiteLink link={group.website} />
        {userIsMember ? (
          <Link to={routedTabID ? `edit/info` : `${groupID}/edit/info`}>
            <EditButton editAction={() => {}}>Edit Group</EditButton>
          </Link>
        ) : (
          <FollowGroupButton targetGroup={group} />
        )}
      </div>
      <div className="group-description">
        <SeeMore id={group.id} initialHeight={GROUP_DESCRIPTION_HEIGHT}>
          <RichTextBody body={group.about} shouldLinkify={true} />
        </SeeMore>
      </div>

      <DonationLink verified={verified} donationLink={group.donationLink} />

      {pinnedItem && <PinnedItem pinnedItem={pinnedItem} />}
    </>
  );
};

function WebsiteLink({link}) {
  if (!link) return <div></div>;
  if (link.length === 0) return <div></div>;
  return (
    <a
      className="group-website-link"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WebsiteIcon /> <span>Website</span>
    </a>
  );
}

function DonationLink({verified, donationLink}) {
  if (!verified || !donationLink) return <></>;

  return (
    <div className="donation-link-container">
      <div className="donation-link-verified-container">
        <h4 className="registered-charity-text">
          Registered Charity{' '}
          <sup>
            <FontAwesomeIcon icon={faCheckCircle} />
          </sup>
        </h4>
        <p className="group-verification-confirmation-explanation">
          This charity page has been verified and can be trusted.
        </p>
      </div>
      <div className="donation-link-donate-container">
        <a target="_blank" href={donationLink} rel="noopener noreferrer">
          <DonateButton />
        </a>
        <p>This will take you to an external site.</p>
      </div>
    </div>
  );
}

function DonateButton() {
  return (
    <button type="button" className="donate-button">
      <h3>Donate</h3>
    </button>
  );
}

function PinnedItem({pinnedItem}) {
  return (
    <div className="pinned-item-container">
      <GenericListItem result={pinnedItem} />
    </div>
  );
}
