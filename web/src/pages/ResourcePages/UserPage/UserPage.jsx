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
import FollowButton from '../../../components/Buttons/FollowButton';

import './UserPage.css';

function fetchUserDetailsFromDB(uuid) {
  return db
    .doc(`users/${uuid}`)
    .get()
    .then((userDetails) => userDetails.data())
    .catch((err) => console.log(err));
}

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

  const fetchResults = (skip, limit, filterOptions, last) =>
    userPageFeedData(skip, limit, filterOptions, userID, last);

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
            id: 'createdPosts',
            name: 'Posts',
          },
        },
        {
          enabled: false,
          data: {
            id: 'authoredPublications',
            name: 'Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'followsUsers',
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
            id: 'coAuthorUsers',
            name: 'Co-Authors',
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
          fetchResults={fetchResults}
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
        <FollowButton />
      </div>
    </div>
  );
}
