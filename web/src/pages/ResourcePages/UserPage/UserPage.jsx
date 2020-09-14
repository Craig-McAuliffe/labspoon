import React, {useContext, useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {FeatureFlags} from '../../../App';
import {db} from '../../../firebase';

import userPageFeedData from './UserPageFeedData';
import UserPageSider from './UserPageSider';
import users from '../../../mockdata/users';

import {getActiveTabID} from '../../../helpers/filters';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import {getPaginatedTopicsFromCollectionRef} from '../../../helpers/topics';
import {getPaginatedPublicationsFromCollectionRef} from '../../../helpers/publications';

import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import MessageButton from '../../../components/Buttons/MessageButton';
import {UserPageAvatar} from '../../../components/Avatar/UserAvatar';
import FollowUserButton from '../../../components/User/FollowUserButton/FollowUserButton';

import './UserPage.css';

export default function UserPage() {
  const featureFlags = useContext(FeatureFlags);
  const [userID, setUserID] = useState(undefined);
  const [userDetails, setUserDetails] = useState(undefined);

  const userIDParam = useParams().userID;
  if (userID !== userIDParam) {
    setUserID(userIDParam);
  }

  let fetchUserDetails;
  if (featureFlags.has('cloud-firestore')) {
    fetchUserDetails = () => fetchUserDetailsFromDB(userID);
  } else {
    fetchUserDetails = () => users().filter((user) => user.id === userID)[0];
  }

  useEffect(() => {
    Promise.resolve(fetchUserDetails())
      .then((userDetails) => {
        setUserDetails(userDetails);
      })
      .catch((err) => console.log(err));
  }, [userID]);

  let fetchFeedData;
  if (featureFlags.has('cloud-firestore')) {
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

  const getDefaultFilter = () => relationshipFilter;

  return (
    <>
      <div className="content-layout">
        {featureFlags.has('related-resources') ? (
          <SuggestedUsers userID={userID} />
        ) : (
          <></>
        )}
        <div className="details-container">
          <UserDetails user={userDetails} />
        </div>

        <FilterableResults
          fetchResults={fetchFeedData}
          getDefaultFilter={getDefaultFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
        />
      </div>
    </>
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

function UserDetails({user}) {
  if (user === undefined) return <></>;
  return (
    <div>
      <div className="user-cover-photo-container">
        <img
          src={user.coverPhoto}
          alt="user cover"
          className="user-cover-photo"
        />
      </div>
      <div className="user-headline">
        <div className="user-page-avatar-container">
          <UserPageAvatar src={user.avatar} width="100px" height="100px" />
        </div>
        <div className="user-headline-text">
          <h2>{user.name}</h2>
          <h3>{user.institution}</h3>
        </div>
      </div>
      <div className="user-message-follow">
        <MessageButton />
        <FollowUserButton pageUser={user} />
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
      const postsCollection = db.collection(`users/${userID}/posts`);
      return getPaginatedPostsFromCollectionRef(postsCollection, limit, last);
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
      let followsQuery = db.collection(`/users/${userID}/followsUsers`);
      if (typeof last !== 'undefined') {
        followsQuery = followsQuery.startAt(last.timestamp);
      }
      return followsQuery
        .limit(limit)
        .get()
        .then((qs) => {
          const users = [];
          qs.forEach((doc) => {
            const user = doc.data();
            user.resourceType = 'user';
            users.push(user);
          });
          return users;
        })
        .catch((err) => console.log(err));
    case 'recommends':
      results = [];
      break;
    case 'coauthors':
      results = [];
      break;
    case 'groups':
      let groupsQuery = db.collection(`users/${userID}/groups`);
      if (typeof last !== 'undefined') {
        groupsQuery = groupsQuery.startAt(last.timestamp);
      }
      return groupsQuery
        .limit(limit)
        .get()
        .then((qs) => {
          const groups = [];
          qs.forEach((doc) => {
            const group = doc.data();
            group.resourceType = 'group';
            groups.push(group);
          });
          return groups;
        })
        .catch((err) => console.log(err));
    case 'topics':
      const topicsCollection = db.collection(`users/${userID}/topics`);
      return getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last);
    default:
      results = [];
  }
  return results;
}
