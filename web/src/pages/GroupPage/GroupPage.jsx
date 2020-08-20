import React from 'react';
import Sider from '../../components/Layout/Sider/Sider';
import groups from '../../mockdata/groups';
import {useParams} from 'react-router-dom';
import GroupPageSider from './GroupPageSider';

import './GroupPage.css';

export default function GroupPage() {
  const groupID = useParams().groupID;
  const group = groups().filter((group) => group.id === groupID)[0];
  const search = false;
  const groupDetails = () => {
    return <div>{group.name} info here</div>;
  };

  const siderTitleChoice = [
    'Other Groups from your Search',
    'Suggested Groups ',
  ];

  // const relationshipFilter = [
  //   {
  //     collectionName: 'Relationship Types',
  //     options: [
  //       {
  //         enabled: false,
  //         data: {
  //           id: 'overview',
  //           name: 'Overview',
  //         },
  //       },
  //       {
  //         enabled: false,
  //         data: {
  //           id: 'posts',
  //           name: 'Posts',
  //         },
  //       },
  //       {
  //         enabled: false,
  //         data: {
  //           id: 'media',
  //           name: 'Media',
  //         },
  //       },
  //       {
  //         enabled: false,
  //         data: {
  //           id: 'publications',
  //           name: 'Publications',
  //         },
  //       },
  //       {
  //         enabled: false,
  //         data: {
  //           id: 'members',
  //           name: 'Members',
  //         },
  //       },
  //     ],

  //     mutable: false,
  //   },
  // ];

  return (
    <>
      <div className="sider-layout">
        <Sider>
          <div className="resource-sider">
            <h3 className="resource-sider-title">
              {search ? siderTitleChoice[0] : siderTitleChoice[1]}
            </h3>
            <div className="suggested-resources-container">
              <GroupPageSider currentGroup={groupID} />
            </div>
          </div>
        </Sider>
      </div>
      <div className="content-layout">
        <div className="details-container">{groupDetails()}</div>

        {/* <FilterableResults
            fetchResults={userPageFeedData}
            defaultFilter={relationshipFilter}
            limit={10}
            useTabs={true}
            useFilterSider={false}
            resourceID={userID}
          /> */}
      </div>
    </>
  );
}
