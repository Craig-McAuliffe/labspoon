import React, {useRef, useEffect, useState} from 'react';
import groups from '../../../mockdata/groups';
import {Link, useParams} from 'react-router-dom';
import GroupPageSider from './GroupPageSider';
import groupPageFeedData from './GroupPageFeedData';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import UserAvatar from '../../../components/Avatar/UserAvatar';
import FollowButton from '../../../components/Buttons/FollowButton';
import MessageButton from '../../../components/Buttons/MessageButton';
import {PinnedPost} from '../../../components/Posts/Post/Post';

import './GroupPage.css';

export default function GroupPage() {
  const groupID = useParams().groupID;
  const group = groups().filter((group) => group.id === groupID)[0];
  const search = false;
  const groupDescriptionRef = useRef();

  const previousPage = () => (
    <Link to="/search" className="vertical-breadcrumb">
      Search Results
    </Link>
  );

  const GroupDetails = () => {
    const [bigDescription, changeBigDescription] = useState({
      display: false,
      size: 100,
    });

    const descriptionSize = {
      height: `${bigDescription.size}px`,
    };

    return (
      <>
        <div className="group-header">
          <div className="group-icon-and-message">
            <UserAvatar src={group.avatar} height="120px" width="120px" />
            <MessageButton />
          </div>
          <div className="group-header-info">
            <div className="group-header-info-headline">
              <div className="group-headline-name-insitution">
                <h2>{group.name}</h2>
                <h3>{group.institution}</h3>
              </div>
              <div className="group-follow-container">
                <FollowButton />
              </div>
            </div>
            <div
              className={'group-description'}
              style={descriptionSize}
              ref={groupDescriptionRef}
            >
              <p>{group.about}</p>
            </div>

            <SeeMore
              bigDescription={bigDescription}
              changeBigDescription={changeBigDescription}
            />
          </div>
        </div>
        <div className="pinned-post-container">
          <PinnedPost post={group.pinnedPost} />
        </div>
      </>
    );
  };

  const SeeMore = ({bigDescription, changeBigDescription}) => {
    const [displaySeeMore, setDisplaySeeMore] = useState();

    useEffect(() => {
      setDisplaySeeMore(
        groupDescriptionRef.current.firstElementChild.scrollHeight > 100
      );
    });

    if (displaySeeMore && bigDescription.display)
      return (
        <div className="group-description-see-more">
          <button
            className="see-more-button"
            onClick={() => changeBigDescription({display: false, size: 100})}
          >
            See less
          </button>
        </div>
      );
    if (displaySeeMore && !bigDescription.display)
      return (
        <div className="group-description-see-more">
          <button
            className="see-more-button"
            onClick={() =>
              changeBigDescription({
                display: true,
                size:
                  groupDescriptionRef.current.firstElementChild.scrollHeight,
              })
            }
          >
            See more
          </button>
        </div>
      );
    else return null;
  };

  const siderTitleChoice = [
    'Other Groups from your Search',
    'Suggested Groups ',
  ];

  const fetchResults = (skip, limit, filterOptions, last) =>
    groupPageFeedData(skip, limit, filterOptions, group);

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
  const getDefaultFilter = () => relationshipFilter;

  return (
    <>
      <div className="sider-layout">
        <div className="resource-sider">
          <h3 className="resource-sider-title">
            {search ? siderTitleChoice[0] : siderTitleChoice[1]}
          </h3>
          <div className="suggested-resources-container">
            <GroupPageSider group={group} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        {previousPage()}
        <div className="group-details">
          <GroupDetails />
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
