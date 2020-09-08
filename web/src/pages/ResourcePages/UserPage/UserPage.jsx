import React, {useContext, useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {FeatureFlags} from '../../../App';
import {db} from '../../../firebase';

import userPageFeedData from './UserPageFeedData';
import UserPageSider from './UserPageSider';
import users from '../../../mockdata/users';

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

  const search = false;

  let fetchFeedData;
  if (featureFlags.has('cloud-firestore')) {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      userPageFeedDataFromDB(skip, limit, filterOptions, userID, last);
  } else {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      userPageFeedData(skip, limit, filterOptions, userID, last);
  }

  const siderTitleChoice = [
    'Other People from your Search',
    'Suggested Researchers (people also follow)',
  ];

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'relevant',
            name: 'Relevant To You',
          },
        },
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
            id: 'recommends',
            name: 'Recommends',
          },
        },
        {
          enabled: false,
          data: {
            id: 'coauthors',
            name: 'Co-Authors',
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
  const getDefaultFilter = () => relationshipFilter;

  return (
    <>
      <div className="sider-layout">
        <div className="resource-sider">
          <h3 className="resource-sider-title">
            {search ? siderTitleChoice[0] : siderTitleChoice[1]}
          </h3>
          <div className="suggested-resources-container">
            <UserPageSider currentUserID={userID} />
          </div>
        </div>
      </div>
      <div className="content-layout">
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
  // defaults to undefined when no tab is selected
  let activeTab;
  if (filterOptions.length === 0) {
    activeTab = undefined;
  } else {
    const activeTabObj = filterOptions[0].options.filter(
      (filterOption) => filterOption.enabled === true
    )[0];
    if (activeTabObj === undefined) {
      activeTab = undefined;
    } else {
      activeTab = activeTabObj.data.id;
    }
  }

  let results;
  switch (activeTab) {
    case 'relevant':
      results = [];
      break;
    case 'posts':
      let postsQuery = db.collection(`users/${userID}/posts`);
      if (typeof last !== 'undefined') {
        postsQuery = postsQuery.startAt(last.timestamp);
      }
      return postsQuery
        .limit(limit)
        .get()
        .then((qs) => {
          const posts = [];
          qs.forEach((doc) => {
            const post = doc.data();
            post.id = doc.id;
            post.resourceType = 'post';
            posts.push(post);
          });
          return posts;
        })
        .catch((err) => console.log(err));
    case 'publications':
      let publicationsQuery = db.collection(`users/${userID}/publications`);
      if (typeof last !== 'undefined') {
        publicationsQuery = publicationsQuery.startAt(last.timestamp);
      }
      return publicationsQuery
        .limit(limit)
        .get()
        .then((qs) => {
          const publications = [];
          qs.forEach((doc) => {
            const publication = doc.data();
            publication.resourceType = 'publication';
            publication.content = {};
            publication.content.authors = publication.authors;
            publication.content.abstract = publication.abstract;
            publications.push(publication);
          });
          return publications;
        })
        .catch((err) => console.log(err));
    case 'follows':
      results = [];
      break;
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
    default:
      results = [];
  }
  return results;
}
