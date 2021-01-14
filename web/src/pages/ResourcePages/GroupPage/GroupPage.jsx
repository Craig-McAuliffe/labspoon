import React, {useRef, useEffect, useState, useContext} from 'react';
import {useRouteMatch, Link, useParams, useHistory} from 'react-router-dom';
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
} from '../../../helpers/resourceTypeDefinitions';
import ResourcesFeed from '../ResourcesFeeds';
import {PaddedContent} from '../../../components/Layout/Content';

import './GroupPage.css';

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
        getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last),
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
    default:
      results = [];
  }
  return [results, null];
}

export default function GroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const [groupID, setGroupID] = useState(undefined);
  const [groupData, setGroupData] = useState(undefined);
  const [verified, setVerified] = useState(false);
  const [userIsMember, setUserIsMember] = useState(false);
  const history = useHistory();
  const {user} = useContext(AuthContext);
  const route = useRouteMatch();

  const groupIDParam = useParams().groupID;
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
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupID, route]);

  useEffect(() => {
    db.doc(`verifiedGroups/${groupID}`)
      .get()
      .then((ds) => setVerified(ds.exists))
      .catch((err) => console.error(err));
  }, [groupID]);

  const groupDescriptionRef = useRef();

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchGroupPageFeedFromDB(groupID, last, limit, filterOptions, skip);

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
            id: 'members',
            name: 'Members',
          },
        },
        {
          enabled: false,
          data: {
            id: OPENPOSITIONS,
            name: 'Open Positions',
          },
        },
        {
          enabled: false,
          data: {
            id: RESEARCHFOCUSES,
            name: 'Research Focuses',
          },
        },
        {
          enabled: false,
          data: {
            id: PHOTOS,
            name: 'Photos',
          },
        },
        {
          enabled: false,
          data: {
            id: VIDEOS,
            name: 'Videos',
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

  if (featureFlags.has('overview')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'overview',
        name: 'Overview',
      },
    });
  }

  relationshipFilter[0].options.push({
    enabled: false,
    data: {
      id: TECHNIQUES,
      name: 'Techniques',
    },
  });

  if (user) {
    db.collection(`groups/${groupID}/members`)
      .where('id', '==', user.uid)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          setUserIsMember(true);
        } else setUserIsMember(false);
      })
      .catch((err) => console.log(err));
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
        tabs={relationshipFilter}
      >
        <PaddedContent>
          <GroupDetails
            group={groupData}
            groupDescriptionRef={groupDescriptionRef}
            userIsMember={userIsMember}
            verified={verified}
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

const GroupDetails = ({group, groupDescriptionRef, userIsMember, verified}) => {
  const featureFlags = useContext(FeatureFlags);
  const [displayFullDescription, setDisplayFullDescription] = useState({
    display: false,
    size: 100,
  });

  if (group === undefined) return <></>;

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
        {userIsMember ? <EditResource /> : null}
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

function EditResource() {
  const {url} = useRouteMatch();
  return (
    <Link to={`${url}/edit/info`}>
      <EditButton editAction={() => {}}>Edit Group</EditButton>
    </Link>
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
