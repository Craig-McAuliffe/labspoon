import React, {useRef, useEffect, useState, useContext} from 'react';
import {Link, useParams, useHistory} from 'react-router-dom';

import {FeatureFlags, AuthContext} from '../../../App';
import {db} from '../../../firebase';

import {getActiveTabID} from '../../../helpers/filters';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../../helpers/topics';
import {getPaginatedPublicationsFromCollectionRef} from '../../../helpers/publications';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';

import groups from '../../../mockdata/groups';
import GroupPageSider from './GroupPageSider';
import groupPageFeedData from './GroupPageFeedData';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import GroupInfoForm from '../../Groups/CreateGroupPage/GroupInfoForm';
import UserAvatar from '../../../components/Avatar/UserAvatar';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import MessageButton from '../../../components/Buttons/MessageButton';
import EditButton from '../../../components/Buttons/EditButton';
import {PinnedPost} from '../../../components/Posts/Post/Post';
import SeeMore from '../../../components/SeeMore';

import './GroupPage.css';

function fetchGroupDataFromDB(id) {
  return db
    .doc(`groups/${id}`)
    .get()
    .then((groupData) => {
      const data = groupData.data();
      data.id = groupData.id;
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
    default:
      results = [];
  }
  return results;
}

export default function GroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const [groupID, setGroupID] = useState(undefined);
  const [groupData, setGroupData] = useState(undefined);
  const [userIsMember, setUserIsMember] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const history = useHistory();
  const {user} = useContext(AuthContext);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }

  let fetchGroupData;
  if (!featureFlags.has('disable-cloud-firestore')) {
    fetchGroupData = () => fetchGroupDataFromDB(groupID);
  } else {
    fetchGroupData = () => groups().filter((group) => group.id === groupID)[0];
  }

  useEffect(() => {
    Promise.resolve(fetchGroupData())
      .then((groupData) => {
        if (!groupData) {
          history.push('/notfound');
        }
        setGroupData(groupData);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      groupPageFeedData(skip, limit, filterOptions, groupData);
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

  if (user) {
    db.collection(`groups/${groupID}/members`)
      .where('id', '==', user.uid)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          setUserIsMember(true);
        } else setUserIsMember(false);
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      {featureFlags.has('related-resources') ? (
        <SuggestedGroups groupData={groupData} />
      ) : (
        <></>
      )}
      <div className="content-layout">
        {previousPage()}
        {editingGroup ? (
          <div className="group-details">
            <EditingGroup
              groupData={groupData}
              setEditingGroup={setEditingGroup}
            />
          </div>
        ) : (
          <>
            <div className="group-details">
              <GroupDetails
                group={groupData}
                groupDescriptionRef={groupDescriptionRef}
                userIsMember={userIsMember}
                setEditingGroup={setEditingGroup}
              />
            </div>
            <FilterableResults
              fetchResults={fetchFeedData}
              getDefaultFilter={getDefaultFilter}
              limit={10}
              useTabs={true}
              useFilterSider={false}
            />
          </>
        )}
      </div>
    </>
  );
}

function SuggestedGroups({groupData}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">Suggested Groups</h3>
        <div className="suggested-resources-container">
          <GroupPageSider group={groupData} />
        </div>
      </div>
    </div>
  );
}

const GroupDetails = ({
  group,
  groupDescriptionRef,
  userIsMember,
  setEditingGroup,
}) => {
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
              <FollowGroupButton targetGroup={group} />
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
      {userIsMember ? (
        <div className="group-page-edit-button-container">
          <EditButton editAction={() => setEditingGroup(true)}>
            Edit Group
          </EditButton>
        </div>
      ) : null}
      <div className="pinned-post-container">
        <PinnedPost post={group.pinnedPost} />
      </div>
    </>
  );
};

function EditingGroup({groupData, setEditingGroup}) {
  const groupID = groupData.id;
  const [groupMembers, setGroupMembers] = useState([]);
  useEffect(() => {
    const fetchGroupMembers = db
      .collection(`groups/${groupID}/members`)
      .get()
      .then((qs) => {
        const users = [];
        qs.forEach((doc) => {
          const user = doc.data();
          user.resourceType = 'user';
          users.push(user);
        });
        return users;
      });
    fetchGroupMembers.then((fetchedMembers) => setGroupMembers(fetchedMembers));
  }, [groupID]);

  const initialValues = {
    name: groupData.name,
    location: groupData.location,
    institution: groupData.institution,
    website: groupData.website,
    about: groupData.about,
  };

  const onEditSubmit = (values) => {
    const writeToDB = () => {
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      batch.update(groupDocRef, values);
      batch
        .commit()
        .catch((err) => alert('batch failed to commit'))
        .then(() => setEditingGroup(false));
    };

    writeToDB();
  };

  return (
    <GroupInfoForm
      initialValues={initialValues}
      onSubmit={onEditSubmit}
      selectedUsers={groupMembers}
      setSelectedUsers={() => {}}
      existingAvatar={groupData.avatar}
      cancelForm={() => setEditingGroup(false)}
      submitText="Save Changes"
    />
  );
}
