import React, {useRef, useEffect, useState, useContext} from 'react';
import {FeatureFlags} from '../../../App';
import {db} from '../../../firebase';

import {getActiveTabID} from '../../../helpers/filters';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../../helpers/topics';
import {getPaginatedPublicationsFromCollectionRef} from '../../../helpers/publications';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';

import groups from '../../../mockdata/groups';
import {Link, useParams} from 'react-router-dom';
import GroupPageSider from './GroupPageSider';
import groupPageFeedData from './GroupPageFeedData';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import UserAvatar from '../../../components/Avatar/UserAvatar';
import FollowButton from '../../../components/Buttons/FollowButton';
import MessageButton from '../../../components/Buttons/MessageButton';
import {PinnedPost} from '../../../components/Posts/Post/Post';
import SeeMore from '../../../components/SeeMore';

import './GroupPage.css';

function fetchGroupDetailsFromDB(id) {
  return db
    .doc(`groups/${id}`)
    .get()
    .then((groupDetails) => {
      const data = groupDetails.data();
      data.id = groupDetails.id;
      return data;
    })
    .catch((err) => console.log(err));
}

function fetchGroupPageFeedFromDB(groupID, last, limit, filterOptions) {
  const activeTab = getActiveTabID(filterOptions);
  let results;
  switch (activeTab) {
    case 'overview':
      results = [];
      break;
    case 'posts':
      const postsCollection = db.collection(`groups/${groupID}/posts`);
      return getPaginatedPostsFromCollectionRef(postsCollection, limit, last);
    case 'media':
      results = [];
      break;
    case 'publications':
      const publicationsCollection = db.collection(
        `groups/${groupID}/publications`
      );
      return getPaginatedPublicationsFromCollectionRef(
        publicationsCollection,
        limit,
        last
      );
    case 'members':
      const usersCollection = db.collection(`groups/${groupID}/members`);
      return getPaginatedUserReferencesFromCollectionRef(
        usersCollection,
        limit,
        last
      );
    case 'topics':
      const topicsCollection = db.collection(`groups/${groupID}/topics`);
      return getPaginatedTopicsFromCollectionRef(topicsCollection, limit, last);
    case 'overview':
      results = [];
      break;
    default:
      results = [];
  }
  return results;
}

export default function GroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const [groupID, setGroupID] = useState(undefined);
  const [groupDetails, setGroupDetails] = useState(undefined);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }

  let fetchGroupDetails;
  if (!featureFlags.has('disable-cloud-firestore')) {
    fetchGroupDetails = () => fetchGroupDetailsFromDB(groupID);
  } else {
    fetchGroupDetails = () =>
      groups().filter((group) => group.id === groupID)[0];
  }

  useEffect(() => {
    Promise.resolve(fetchGroupDetails())
      .then((groupDetails) => {
        setGroupDetails(groupDetails);
      })
      .catch((err) => console.log(err));
  }, [groupID]);

  const groupDescriptionRef = useRef();

  const previousPage = () => (
    <Link to="/search" className="vertical-breadcrumb">
      Search Results
    </Link>
  );

  let fetchFeedData;
  if (!featureFlags.has('disable-cloud-firestore')) {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      fetchGroupPageFeedFromDB(groupID, last, limit, filterOptions);
  } else {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      groupPageFeedData(skip, limit, filterOptions, groupDetails);
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
            id: 'members',
            name: 'Members',
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
  const getDefaultFilter = () => relationshipFilter;

  if (featureFlags.has('group-media')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'media',
        name: 'Media',
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
    <>
      {featureFlags.has('related-resources') ? (
        <SuggestedGroups groupDetails={groupDetails} />
      ) : (
        <></>
      )}
      <div className="content-layout">
        {previousPage()}
        <div className="group-details">
          <GroupDetails
            group={groupDetails}
            groupDescriptionRef={groupDescriptionRef}
          />
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

function SuggestedGroups({groupDetails}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">Suggested Groups</h3>
        <div className="suggested-resources-container">
          <GroupPageSider group={groupDetails} />
        </div>
      </div>
    </div>
  );
}

const GroupDetails = ({group, groupDescriptionRef}) => {
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
            displayFullDescription={displayFullDescription}
            setDisplayFullDescription={setDisplayFullDescription}
            groupDescriptionRef={groupDescriptionRef}
            id={group.id}
          />
        </div>
      </div>
      <div className="pinned-post-container">
        <PinnedPost post={group.pinnedPost} />
      </div>
    </>
  );
};
