import React from 'react';
import {useParams} from 'react-router-dom';
import userPageFeedData from './UserPageFeedData';
import UserPageSider from './UserPageSider';
import users from '../../../mockdata/users';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import MessageButton from '../../../components/Buttons/MessageButton';
import {UserPageAvatar} from '../../../components/Avatar/UserAvatar';
import FollowButton from '../../../components/Buttons/FollowButton';

import './UserPage.css';

export default function UserPage() {
  const userID = useParams().userId;
  const user = users().filter((user) => user.id === userID)[0];
  const search = false;

  const fetchResults = (skip, limit, filterOptions, last) =>
    userPageFeedData(skip, limit, filterOptions, userID, last);

  const UserDetails = () => {
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
  };

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
          <UserDetails />
        </div>

        <FilterableResults
          fetchResults={fetchResults}
          defaultFilter={relationshipFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
        />
      </div>
    </>
  );
}
