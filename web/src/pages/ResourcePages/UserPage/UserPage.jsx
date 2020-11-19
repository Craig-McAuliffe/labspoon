import React, {useContext, useState, useEffect} from 'react';
import {useParams, useHistory, Link} from 'react-router-dom';
import {FeatureFlags, AuthContext} from '../../../App';
import {db} from '../../../firebase';

import UserPageSider from './UserPageSider';
import {getActiveTabID} from '../../../helpers/filters';
import {
  getPaginatedPostsFromCollectionRef,
  translateOptionalFields,
} from '../../../helpers/posts';
import {getPaginatedTopicsFromCollectionRef} from '../../../helpers/topics';
import {getPaginatedPublicationsFromCollectionRef} from '../../../helpers/publications';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../../helpers/groups';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedRecommendationsFromCollectionRef} from '../../../helpers/recommendations';

import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  NewFilterMenuWrapper,
  FilterManager,
} from '../../../components/FilterableResults/FilterableResults';
import MessageButton from '../../../components/Buttons/MessageButton';
import EditButton from '../../../components/Buttons/EditButton';
import {
  UserPageAvatar,
  CoverPhoto,
} from '../../../components/Avatar/UserAvatar';
import FollowUserButton from '../../../components/User/FollowUserButton/FollowUserButton';
import EditUserPage from './EditUserPage';

import './UserPage.css';

export default function UserPage() {
  const featureFlags = useContext(FeatureFlags);
  const [userID, setUserID] = useState(undefined);
  const [userDetails, setUserDetails] = useState(undefined);
  const history = useHistory();

  const userIDParam = useParams().userID;
  if (userID !== userIDParam) {
    setUserID(userIDParam);
  }

  const fetchUserDetails = () => fetchUserDetailsFromDB(userID);

  useEffect(() => {
    Promise.resolve(fetchUserDetails())
      .then((userDetails) => {
        if (!userDetails) {
          history.push('/notfound');
        }
        setUserDetails(userDetails);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    userPageFeedDataFromDB(skip, limit, filterOptions, userID, last);

  if (history.location.pathname.includes('edit_profile'))
    return <EditUserPage user={userDetails} />;

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
            id: 'follows',
            name: 'Follows',
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

  if (featureFlags.has('coauthors')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'coauthors',
        name: 'Co-Authors',
      },
    });
  }

  if (featureFlags.has('recommendations')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'recommends',
        name: 'Recommends',
      },
    });
  }

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
    <div className="content-layout">
      {featureFlags.has('related-resources') ? (
        <SuggestedUsers userID={userID} />
      ) : (
        <></>
      )}
      <div className="details-container">
        <UserInfo user={userDetails} />
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
}

function SuggestedUsers({userID}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">Suggested Researchers</h3>
        <div className="suggested-resources-container">
          <UserPageSider currentUserID={userID} />
        </div>
      </div>
    </div>
  );
}

function UserInfo({user}) {
  const {userProfile} = useContext(AuthContext);
  const featureFlags = useContext(FeatureFlags);
  if (user === undefined) return <></>;
  const ownProfile = userProfile && userProfile.id === user.id;
  return (
    <div>
      <div className="user-cover-photo-container">
        <CoverPhoto src={user.coverPhoto} />
      </div>
      <div className="user-headline">
        <div className="user-page-avatar-container">
          <UserPageAvatar src={user.avatar} width="100px" height="100px" />
        </div>
        <div className="user-headline-text">
          <h2>{user.name}</h2>
          <h4>{user.institution ? user.institution : <button></button>}</h4>
          <h4>{user.position ? user.position : <button></button>}</h4>
        </div>
      </div>
      <div className="user-message-follow">
        {ownProfile ? (
          <>
            <div></div>
            <Link to={`/user/${user.id}/edit_profile`}>
              <EditButton>Edit Profile</EditButton>
            </Link>
          </>
        ) : (
          <>
            {featureFlags.has('message-user') ? <MessageButton /> : <div></div>}
            <FollowUserButton targetUser={user} />
          </>
        )}
      </div>
    </div>
  );
}

export function fetchUserDetailsFromDB(uuid) {
  return db
    .doc(`users/${uuid}`)
    .get()
    .then((userDetails) => userDetails.data())
    .catch((err) => console.log(err));
}

function userPageFeedDataFromDB(skip, limit, filterOptions, userID, last) {
  const activeTab = getActiveTabID(filterOptions);
  let results;
  switch (activeTab) {
    case 'overview':
      results = [];
      break;
    case 'posts':
      const postsCollection = db
        .collection(`users/${userID}/posts`)
        .orderBy('timestamp', 'desc');
      return [
        getPaginatedPostsFromCollectionRef(postsCollection, limit, last).then(
          translateOptionalFields
        ),
        null,
      ];
    case 'publications':
      const publicationsCollection = db.collection(
        `users/${userID}/publications`
      );
      return [
        getPaginatedPublicationsFromCollectionRef(
          publicationsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'follows':
      const followsQuery = db.collection(`/users/${userID}/followsUsers`);
      return [
        getPaginatedUserReferencesFromCollectionRef(followsQuery, limit, last),
        null,
      ];
    case 'recommends':
      const recommendationsCollection = db.collection(
        `users/${userID}/recommendations`
      );
      return [
        getPaginatedRecommendationsFromCollectionRef(
          recommendationsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'coauthors':
      results = [];
      break;
    case 'groups':
      const groupsCollection = db.collection(`users/${userID}/groups`);
      return [
        getPaginatedGroupReferencesFromCollectionRef(
          groupsCollection,
          limit,
          last
        ),
        null,
      ];
    case 'topics':
      const topicsCollection = db.collection(`users/${userID}/topics`);
      return [
        getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last),
        null,
      ];
    default:
      results = [];
  }
  return results;
}
