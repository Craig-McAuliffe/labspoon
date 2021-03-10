import React, {useRef, useEffect, useState, useContext} from 'react';
import {Link, useParams, useHistory} from 'react-router-dom';
import Linkify from 'linkifyjs/react';
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
import {PinnedPost} from '../../../components/Posts/Post/Post';
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
} from '../../../helpers/resourceTypeDefinitions';
import ResourcesFeed from '../ResourcesFeeds';
import {PaddedContent} from '../../../components/Layout/Content';

import './GroupPage.css';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

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
      return [
        getPaginatedPostsFromCollectionRef(postsCollection, limit, last),
        null,
      ];
    case 'publications':
      const publicationsCollection = db.collection(
        `groups/${groupID}/publications`
      );
      return [
        getPaginatedPublicationsFromCollectionRef(
          publicationsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'members':
      const usersCollection = db.collection(`groups/${groupID}/members`);
      return [
        getPaginatedUserReferencesFromCollectionRef(
          usersCollection,
          limit,
          last
        ),
        null,
      ];
    case 'topics':
      const topicsCollection = db.collection(`groups/${groupID}/topics`);
      return [
        getPaginatedTopicsFromCollectionRef(
          topicsCollection,
          limit,
          last,
          true
        ),
        null,
      ];
    case PHOTOS:
      const photosCollection = db.collection(`groups/${groupID}/photos`);
      return [
        getPaginatedImagesFromCollectionRef(photosCollection, limit, last),
        null,
      ];
    case VIDEOS:
      const videosCollection = db.collection(`groups/${groupID}/videos`);
      return [
        getPaginatedVideosFromCollectionRef(videosCollection, limit, last),
        null,
      ];
    case OPENPOSITIONS:
      const openPositionsCollection = db.collection(
        `groups/${groupID}/openPositions`
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
    case RESEARCHFOCUSES:
      const researchFocusesCollection = db.collection(
        `groups/${groupID}/${RESEARCHFOCUSES}`
      );

      return [
        getPaginatedResourcesFromCollectionRef(
          researchFocusesCollection,
          limit,
          last,
          RESEARCHFOCUS
        ),
        null,
      ];
    case TECHNIQUES:
      const techniquesCollection = db.collection(
        `groups/${groupID}/techniques`
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
    case 'followedByUsers':
      const followersCollection = db.collection(
        `groups/${groupID}/followedByUsers`
      );
      return [
        getPaginatedUserReferencesFromCollectionRef(
          followersCollection,
          limit,
          last,
          true
        ),
        null,
      ];
    default:
      results = [];
  }
  return [results, null];
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

const GroupDetails = ({
  group,
  groupDescriptionRef,
  userIsMember,
  verified,
  groupID,
  routedTabID,
}) => {
  const featureFlags = useContext(FeatureFlags);
  const [displayFullDescription, setDisplayFullDescription] = useState({
    display: false,
    size: 100,
  });

  if (group === undefined) return <LoadingSpinner />;

  const descriptionSize = {
    height: `${displayFullDescription.size}px`,
  };

  return (
    <>
      <div className="group-header">
        <div className="group-icon-and-message">
          <GroupAvatar src={group.avatar} height="160" width="160" />
          {featureFlags.has('group-message-button') ? <MessageButton /> : null}
        </div>
        <div className="group-header-info">
          <div className="group-header-name-insitution">
            <h2>{group.name}</h2>
            <h3>{group.institution}</h3>
          </div>
          <FollowGroupButton targetGroup={group} />
        </div>
      </div>
      <div
        className={'group-description'}
        style={descriptionSize}
        ref={groupDescriptionRef}
      >
        <Linkify tagName="p">{group.about}</Linkify>
      </div>

      <SeeMore
        displayFullDescription={displayFullDescription}
        setDisplayFullDescription={setDisplayFullDescription}
        descriptionRef={groupDescriptionRef}
        id={group.id}
      />

      <DonationLink verified={verified} donationLink={group.donationLink} />
      {featureFlags.has('group-pinned-post') ? (
        <div className="pinned-post-container">
          <PinnedPost post={group.pinnedPost} />
        </div>
      ) : null}
      <div className="group-email-edit-container">
        <WebsiteLink link={group.website} />
        {userIsMember ? (
          <Link to={routedTabID ? `edit/info` : `${groupID}/edit/info`}>
            <EditButton editAction={() => {}}>Edit Group</EditButton>
          </Link>
        ) : null}
      </div>
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
