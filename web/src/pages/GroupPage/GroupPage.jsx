import React from 'react';
import groups from '../../mockdata/groups';
import {Link, useParams} from 'react-router-dom';
import GroupPageSider from './GroupPageSider';
import groupPageFeedData from './GroupPageFeedData';
import FilterableResults from '../../components/FilterableResults/FilterableResults';
import UserAvatar from '../../components/Avatar/UserAvatar';
import {MessageIcon} from '../../assets/ResourceIcons';
import FollowButton from '../../components/Buttons/FollowButton';
import {PinnedPost} from '../../components/Posts/Post/Post';

import './GroupPage.css';

export default function GroupPage() {
  const groupID = useParams().groupID;
  const group = groups().filter((group) => group.id === groupID)[0];
  const search = false;

  const previousPage = () => (
    <Link to="/search" className="vertical-breadcrumb">
      Search Results
    </Link>
  );

  const groupDetails = () => {
    return (
      <>
        <div className="group-header">
          <div>
            <UserAvatar src={group.avatar} height="120px" width="120px" />
            <button>
              <MessageIcon />
              Message
            </button>
          </div>
          <div className="info-container">{group.name}</div>
          <div className="group-header-headline">
            <div>
              <h2>{group.name}</h2>
              <h3>{group.institution}</h3>
            </div>
            <FollowButton />
          </div>
          <div>
            <button>See more</button>
          </div>
        </div>
        <div>
          <PinnedPost post={group.pinnedPost} />
        </div>
      </>
    );
  };

  const siderTitleChoice = [
    'Other Groups from your Search',
    'Suggested Groups ',
  ];

  const fetchResults = (skip, limit, filterOptions, last) =>
    groupPageFeedData(skip, limit, filterOptions, groupID, last);

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'overview',
            name: 'Overview',
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
            id: 'media',
            name: 'Media',
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
            <GroupPageSider currentGroup={groupID} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        {previousPage()}
        <div className="group-details">{groupDetails()}</div>
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
