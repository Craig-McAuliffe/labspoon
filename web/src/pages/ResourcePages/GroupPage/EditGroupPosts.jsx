import React, {useState, createContext, useEffect, useContext} from 'react';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import {
  getActiveTabID,
  getEnabledIDsFromFilter,
} from '../../../helpers/filters';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import FilterableResults, {
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
  FilterManager,
  FilterableResultsContext,
} from '../../../components/FilterableResults/FilterableResults';
import {EditGroupTabs} from './EditGroup';

import {db} from '../../../firebase';

import './GroupPage.css';

export const SelectedListItemsContext = createContext();

const ADD = 'add';
const REMOVE = 'remove';

export default function EditingGroupInfo({
  groupData,
  setEditingGroup,
  tabs,
  setEditType,
  editType,
}) {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [postsEditSuccess, setPostsEditSuccess] = useState(false);
  const [resetSelection, setResetSelection] = useState(false);
  const groupID = groupData.id;

  // Deselect posts when successfully adding posts
  useEffect(() => {
    if (postsEditSuccess) {
      setResetSelection(true);
      setTimeout(() => {
        setPostsEditSuccess(false);
      }, 3000);
    }
  }, [postsEditSuccess]);

  useEffect(() => {
    if (resetSelection) {
      setSelectedPosts([]);
      setResetSelection(false);
    }
  }, [resetSelection]);

  const addOrRemoveOptions = [
    {
      collectionName: 'Add or Remove',
      options: [
        {
          enabled: false,
          data: {
            id: 'add',
            name: 'Add Posts',
          },
        },
        {
          enabled: false,
          data: {
            id: 'remove',
            name: 'Remove Posts',
          },
        },
      ],

      mutable: false,
    },
  ];

  function fetchPostsFromDB(skip, limit, filter, last) {
    const activeTab = filter ? getActiveTabID(filter) : null;
    switch (activeTab) {
      case ADD:
        return fetchPostsByFilteredMember(
          limit,
          filter,
          last,
          groupID,
          selectedPosts
        );
      case REMOVE:
        return fetchPostsOnGroupByFilteredMember(
          limit,
          filter,
          last,
          groupID,
          selectedPosts
        );
      default:
        return [];
    }
  }

  const defaultFilterTypes = (filter) => {
    const activeTab = filter ? getActiveTabID(filter) : null;
    return activeTab === REMOVE
      ? getGroupPostsAuthorsFilter(groupID)
      : getMemberFilter(groupID);
  };

  return (
    <>
      <FilterableResults fetchResults={fetchPostsFromDB} limit={10}>
        <TabReset
          setResetSelection={setResetSelection}
          setPostsEditSuccess={setPostsEditSuccess}
        />
        <FilterManager>
          <div className="sider-layout">
            <NewFilterMenuWrapper
              getDefaultFilter={defaultFilterTypes}
              radio={true}
              dependentOnTab={true}
            />
          </div>
          <div className="content-layout">
            <div className="feed-container">
              <EditGroupTabs
                editType={editType}
                tabs={tabs}
                setEditType={setEditType}
              />
              <div className="edit-group-posts-cancel">
                <button onClick={() => setEditingGroup(false)}>
                  <h4>Back to Group Page</h4>
                </button>
              </div>
              <ResourceTabs tabs={addOrRemoveOptions} affectsFilter={true} />
              {selectedPosts.length > 0 ? (
                <AddOrRemoveConfirmation
                  selectedPosts={selectedPosts}
                  groupData={groupData}
                  setResetSelection={setResetSelection}
                  setPostsEditSuccess={setPostsEditSuccess}
                />
              ) : null}
              <div className="edit-group-posts-success-message-container">
                <GroupPostSuccessMessage
                  groupName={groupData.name}
                  setPostsEditSuccess={setPostsEditSuccess}
                  postsEditSuccess={postsEditSuccess}
                />
              </div>

              <SelectedListItemsContext.Provider
                value={{
                  setSelectedPosts: setSelectedPosts,
                  resetSelection: resetSelection,
                }}
              >
                <NewResultsWrapper />
              </SelectedListItemsContext.Provider>
            </div>
          </div>
        </FilterManager>
      </FilterableResults>
    </>
  );
}

const TabReset = ({setResetSelection, setPostsEditSuccess}) => {
  const filterableResults = useContext(FilterableResultsContext);
  const filters = filterableResults.filter;
  const tabFilter = filters ? filters[0] : undefined;
  // Resets selection if user switches between member or tabs
  useEffect(() => {
    if (filters) {
      const activeTabID = getActiveTabID(filters);
      if (activeTabID) {
        setResetSelection(true);
        setPostsEditSuccess(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFilter, setPostsEditSuccess, setResetSelection]);
  return null;
};

const AddOrRemoveConfirmation = ({
  selectedPosts,
  groupData,
  setResetSelection,
  setPostsEditSuccess,
}) => {
  const filterableResults = useContext(FilterableResultsContext);
  const filter = filterableResults.filter;
  const activeTab = filter ? getActiveTabID(filter) : undefined;

  if (activeTab === undefined) return null;

  return (
    <div className="edit-group-posts-selected-posts-container">
      {activeTab === ADD ? (
        <h2>
          Add {selectedPosts.length} selected posts to {groupData.name}
        </h2>
      ) : (
        <h2>
          Remove {selectedPosts.length} selected posts from {groupData.name}
        </h2>
      )}
      <div className="edit-group-posts-selected-posts-actions">
        <button onClick={() => setResetSelection(true)}>Deselect All</button>
        {activeTab === ADD ? (
          <PrimaryButton
            onClick={() =>
              addPostsToGroup(
                selectedPosts,
                groupData.id,
                setResetSelection,
                setPostsEditSuccess
              )
            }
          >
            Add to Group
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() =>
              removePostsFromGroup(
                selectedPosts,
                groupData.id,
                setResetSelection,
                setPostsEditSuccess
              )
            }
          >
            Remove from Group
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

function addPostsToGroup(
  selectedPosts,
  groupID,
  setResetSelection,
  setPostsEditSuccess
) {
  selectedPosts.forEach((selectedPost) => {
    delete selectedPost.hasSelector;
    delete selectedPost.hasBeenSelected;
    db.doc(`groups/${groupID}/posts/${selectedPost.id}`)
      .set(selectedPost)
      .then(() => {
        setResetSelection(true);
        setPostsEditSuccess(true);
      })
      .catch((err) => {
        console.log(err);
        alert(`Sorry, something went wrong. Please try again later.`);
      });
  });
}

function removePostsFromGroup(
  selectedPosts,
  groupID,
  setResetSelection,
  setPostsEditSuccess
) {
  selectedPosts.forEach((selectedPost) => {
    db.doc(`groups/${groupID}/posts/${selectedPost.id}`)
      .delete()
      .then(() => {
        setResetSelection(true);
        setPostsEditSuccess(true);
      })
      .catch((err) => {
        console.log(err);
        alert(`Sorry, something went wrong. Please try again later.`);
      });
  });
}

export function GroupPostSuccessMessage({
  groupName,
  setPostsEditSuccess,
  postsEditSuccess,
}) {
  const filterableResults = useContext(FilterableResultsContext);
  const filter = filterableResults.filter;
  const activeTab = filter ? getActiveTabID(filter) : undefined;

  useEffect(() => {
    setPostsEditSuccess(false);
  }, [activeTab, setPostsEditSuccess]);

  if (!postsEditSuccess) return null;

  if (activeTab === undefined) return null;

  return (
    <div className="onboarding-success-overlay-container">
      <div className="success-overlay">
        <h3>
          {activeTab === ADD
            ? `Posts Added to ${groupName}!`
            : `Posts Removed from ${groupName}!`}
        </h3>
      </div>
    </div>
  );
}

const fetchPostsByFilteredMember = (
  limit,
  filter,
  last,
  groupID,
  selectedPosts
) => {
  const enabledFilterIDs = filter ? getEnabledIDsFromFilter(filter) : undefined;
  if (enabledFilterIDs === undefined) return [];
  const enabledAuthorID = enabledFilterIDs.get('Group Members')[0];
  if (enabledAuthorID === undefined) return [];
  const enabledMemberDBRef = db
    .collection(`users/${enabledAuthorID}/posts`)
    .orderBy('timestamp', 'desc');
  const postsByMembersPromise = getPaginatedPostsFromCollectionRef(
    enabledMemberDBRef,
    limit,
    last
  ).then((postsList) => {
    const postsWithSelector = postsList.map((fetchedPost) =>
      db
        .doc(`groups/${groupID}/posts/${fetchedPost.id}`)
        .get()
        .then((qs) => {
          fetchedPost.hasSelector = qs.exists ? 'inactive-add' : 'active-add';
          // Allows user to switch sider filter and still keep selection
          fetchedPost.hasBeenSelected = selectedPosts.some(
            (selectedPost) => selectedPost.id === fetchedPost.id
          )
            ? true
            : false;
          return fetchedPost;
        })
    );
    return Promise.all(postsWithSelector);
  });
  return postsByMembersPromise;
};

const fetchPostsOnGroupByFilteredMember = (
  limit,
  filter,
  last,
  groupID,
  selectedPosts
) => {
  const enabledFilterIDs = filter ? getEnabledIDsFromFilter(filter) : undefined;
  if (enabledFilterIDs === undefined) return [];
  const enabledAuthorID = enabledFilterIDs.get('Group Members')[0];
  if (enabledAuthorID === undefined) return [];

  const enabledMemberDBRef = db
    .collection(`groups/${groupID}/posts`)
    .where('author.id', '==', enabledAuthorID)
    .orderBy('timestamp', 'desc');

  const groupPostsPromise = getPaginatedPostsFromCollectionRef(
    enabledMemberDBRef,
    limit,
    last
  )
    .then((postsList) => {
      postsList.forEach((fetchedPost) => {
        fetchedPost.hasSelector = 'active-remove';
        // Allows user to switch sider filter and still keep selection
        fetchedPost.hasBeenSelected = selectedPosts.some(
          (selectedPost) => selectedPost.id === fetchedPost.id
        )
          ? true
          : false;
      });
      return postsList;
    })
    .catch((err) => console.log('Could not get group posts', err));
  return groupPostsPromise;
};

const getMemberFilter = (groupID) => {
  const membersDBCollectionRef = db.collection(`groups/${groupID}/members`);
  const filterCollections = [];
  const memberFilterPromise = getPaginatedUserReferencesFromCollectionRef(
    membersDBCollectionRef,
    20
  )
    .then((fetchedMembers) => {
      const filterCollection = {
        collectionName: 'Group Members',
        options: [],
        mutable: true,
      };

      fetchedMembers.forEach((fetchedGroupMember, i) => {
        filterCollection.options.push({
          data: {
            id: fetchedGroupMember.id,
            name: fetchedGroupMember.name,
          },
          enabled: i === 0,
        });
      });
      return filterCollection;
    })
    .catch((err) => console.log('filter err', err));
  filterCollections.push(memberFilterPromise);
  return Promise.all(filterCollections);
};

const getGroupPostsAuthorsFilter = (groupID) => {
  const filterCollections = [];
  const postUserFilterRef = db.collection(
    `groups/${groupID}/feeds/postsFeed/filterCollections/user/filterOptions`
  );
  const postUserFilterPromise = getPaginatedUserReferencesFromCollectionRef(
    postUserFilterRef,
    20
  )
    .then((fetchedMembers) => {
      const filterCollection = {
        collectionName: 'Group Members',
        options: [],
        mutable: true,
      };

      fetchedMembers.forEach((fetchedGroupMember, i) => {
        filterCollection.options.push({
          data: {
            id: fetchedGroupMember.resourceID,
            name: fetchedGroupMember.name,
          },
          enabled: i === 0,
        });
      });
      return filterCollection;
    })
    .catch((err) => console.log('filter err', err));
  filterCollections.push(postUserFilterPromise);
  return Promise.all(filterCollections);
};
