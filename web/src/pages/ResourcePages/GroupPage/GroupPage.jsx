import React, {useRef, useEffect, useState, useContext} from 'react';
import {FeatureFlags} from '../../../App';
import {db} from '../../../firebase';

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

export default function GroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const [groupID, setGroupID] = useState(undefined);
  const [groupDetails, setGroupDetails] = useState(undefined);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }

  let fetchGroupDetails;
  if (featureFlags.has('cloud-firestore')) {
    fetchGroupDetails = () => fetchGroupDetailsFromDB(groupID);
  } else {
    fetchGroupDetails = () =>
      groups().filter((group) => group.id === groupID)[0];
  }

  useEffect(() => {
    Promise.resolve(fetchGroupDetails())
      .then((groupDetails) => {
        console.log('setting group details', groupDetails);
        setGroupDetails(groupDetails);
      })
      .catch((err) => console.log(err));
  }, [groupID]);

  const search = false;
  const groupDescriptionRef = useRef();

  const previousPage = () => (
    <Link to="/search" className="vertical-breadcrumb">
      Search Results
    </Link>
  );

  const siderTitleChoice = [
    'Other Groups from your Search',
    'Suggested Groups ',
  ];

  const fetchResults = (skip, limit, filterOptions, last) =>
    groupPageFeedData(skip, limit, filterOptions, groupDetails);

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
            <GroupPageSider group={groupDetails} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        {previousPage()}
        <div className="group-details">
          <GroupDetails
            group={groupDetails}
            groupDescriptionRef={groupDescriptionRef}
          />
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

export const SeeMore = ({
  displayFullDescription,
  setDisplayFullDescription,
  groupDescriptionRef,
}) => {
  const [displaySeeMore, setDisplaySeeMore] = useState();

  useEffect(() => {
    setDisplaySeeMore(
      groupDescriptionRef.current.firstElementChild.scrollHeight > 100
    );
  });

  if (!displaySeeMore) return null;
  return (
    <div className="group-description-see-more">
      <button
        className="see-more-button"
        onClick={() =>
          displayFullDescription.display
            ? setDisplayFullDescription({display: false, size: 100})
            : setDisplayFullDescription({
                display: true,
                size:
                  groupDescriptionRef.current.firstElementChild.scrollHeight,
              })
        }
      >
        {displayFullDescription.display ? <>See less</> : <>See more</>}
      </button>
    </div>
  );
};

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
          />
        </div>
      </div>
      <div className="pinned-post-container">
        <PinnedPost post={group.pinnedPost} />
      </div>
    </>
  );
};
