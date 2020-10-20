import React, {useContext, useState, useEffect} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {FeatureFlags, AuthContext} from '../../../App';
import {db} from '../../../firebase';

import userPageFeedData from './UserPageFeedData';
import UserPageSider from './UserPageSider';
import users from '../../../mockdata/users';

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
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';

import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  NewFilterMenuWrapper,
  FilterManager,
} from '../../../components/FilterableResults/FilterableResults';
import EditUserPage from './EditUserPage';
import MessageButton from '../../../components/Buttons/MessageButton';
import EditButton from '../../../components/Buttons/EditButton';
import {UserPageAvatar} from '../../../components/Avatar/UserAvatar';
import FollowUserButton from '../../../components/User/FollowUserButton/FollowUserButton';

import './UserPage.css';

export default function UserPage() {
  const featureFlags = useContext(FeatureFlags);
  const [userID, setUserID] = useState(undefined);
  const [userDetails, setUserDetails] = useState(undefined);
  const [editingUserProfile, setEditingUserProfile] = useState(false);
  const history = useHistory();

  const userIDParam = useParams().userID;
  if (userID !== userIDParam) {
    setUserID(userIDParam);
  }

  let fetchUserDetails;
  if (!featureFlags.has('disable-cloud-firestore')) {
    fetchUserDetails = () => fetchUserDetailsFromDB(userID);
  } else {
    fetchUserDetails = () => users().filter((user) => user.id === userID)[0];
  }

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

  let fetchFeedData;
  if (!featureFlags.has('disable-cloud-firestore')) {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      userPageFeedDataFromDB(skip, limit, filterOptions, userID, last);
  } else {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      userPageFeedData(skip, limit, filterOptions, userID, last);
  }

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
  if (editingUserProfile)
    return (
      <EditUserPage
        user={userDetails}
        cancelEdit={() => setEditingUserProfile(false)}
      />
    );
  return (
    <div className="content-layout">
      {featureFlags.has('related-resources') ? (
        <SuggestedUsers userID={userID} />
      ) : (
        <></>
      )}
      <div className="details-container">
        <UserDetails
          user={userDetails}
          setEditingUserProfile={setEditingUserProfile}
        />
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

function UserDetails({user, setEditingUserProfile}) {
  const {userProfile} = useContext(AuthContext);
  if (user === undefined) return <></>;
  const ownProfile = userProfile && userProfile.id === user.id;
  return (
    <div>
      <div className="user-cover-photo-container">
        <img
          src={
            user.coverPhoto
              ? user.coverPhoto
              : 'https://i.ibb.co/HNJcLdj/user-cover-photo-default-1-2.jpg'
          }
          alt="user cover"
          className="user-cover-photo"
        />
      </div>
      <div className="user-headline">
        <div className="user-page-avatar-container">
          {user.avatar ? (
            <UserPageAvatar src={user.avatar} width="100px" height="100px" />
          ) : (
            <img
              src={DefaultUserIcon}
              alt="user icon"
              className="user-page-default-user-avatar"
            />
          )}
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
            <EditButton editAction={() => setEditingUserProfile(true)}>
              Edit Profile
            </EditButton>
          </>
        ) : (
          <>
            <MessageButton />
            <FollowUserButton targetUser={user} />{' '}
          </>
        )}
      </div>
    </div>
  );
}

function fetchUserDetailsFromDB(uuid) {
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
      return getPaginatedPostsFromCollectionRef(
        postsCollection,
        limit,
        last
      ).then(translateOptionalFields);
    case 'publications':
      const publicationsCollection = db.collection(
        `users/${userID}/publications`
      );
      return getPaginatedPublicationsFromCollectionRef(
        publicationsCollection,
        limit,
        last
      );
    case 'follows':
      const followsQuery = db.collection(`/users/${userID}/followsUsers`);
      return getPaginatedUserReferencesFromCollectionRef(
        followsQuery,
        limit,
        last
      );
    case 'recommends':
      const recommendationsCollection = db.collection(
        `users/${userID}/recommendations`
      );
      return getPaginatedRecommendationsFromCollectionRef(
        recommendationsCollection,
        limit,
        last
      );
    case 'coauthors':
      results = [];
      break;
    case 'groups':
      const groupsCollection = db.collection(`users/${userID}/groups`);
      return getPaginatedGroupReferencesFromCollectionRef(
        groupsCollection,
        limit,
        last
      );
    case 'topics':
      const topicsCollection = db.collection(`users/${userID}/topics`);
      return getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last);
    default:
      results = [];
  }
  return results;
}
