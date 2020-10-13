import React, {useState, createContext, useEffect} from 'react';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import SuccessMessage from '../../../components/Forms/SuccessMessage';
import FilterableResults, {
  NewFilterMenuWrapper,
  NewResultsWrapper,
} from '../../../components/FilterableResults/FilterableResults';
import {EditGroupTabs} from './EditGroup';
import {db} from '../../../firebase';

import './GroupPage.css';

export const SelectedListItemsContext = createContext();

export default function EditingGroupInfo({
  groupData,
  setEditingGroup,
  tabs,
  setEditType,
  editType,
}) {
  const ADD = 'add';
  const REMOVE = 'remove';
  const [addOrRemove, setAddOrRemove] = useState(ADD);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [filteredMember, setFilteredMember] = useState('');
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [resetSelection, setResetSelection] = useState(false);
  const groupID = groupData.id;
  const membersDBCollectionRef = db.collection(`groups/${groupID}/members`);

  // Resets selection if user switches between member or tabs
  useEffect(() => {
    setResetSelection(true);
    setDisplaySuccessMessage(false);
  }, [filteredMember, addOrRemove]);

  // Deselect posts when successfully adding posts
  useEffect(() => {
    if (displaySuccessMessage) {
      setResetSelection(true);
      setTimeout(() => {
        setDisplaySuccessMessage(false);
      }, 3000);
    }
  }, [displaySuccessMessage]);

  useEffect(() => {
    if (resetSelection) {
      setSelectedPosts([]);
      setResetSelection(false);
    }
  }, [resetSelection]);

  async function addPostsToGroup() {
    selectedPosts.forEach((selectedPost) => {
      delete selectedPost.hasSelector;
      db.doc(`groups/${groupID}/posts/${selectedPost.id}`)
        .set(selectedPost)
        .then(() => {
          setResetSelection(true);
          setDisplaySuccessMessage(true);
        })
        .catch((err) => {
          console.log(err);
          alert(`Sorry, something went wrong. Please try again later.`);
        });
    });
  }

  async function removePostsFromGroup() {
    selectedPosts.forEach((selectedPost) => {
      db.doc(`groups/${groupID}/posts/${selectedPost.id}`)
        .delete()
        .then(() => {
          setResetSelection(true);
          setDisplaySuccessMessage(true);
        })
        .catch((err) => {
          console.log(err);
          alert(`Sorry, something went wrong. Please try again later.`);
        });
    });
  }

  const getMemberFilter = () => {
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

  const getGroupPostsMemberFilter = () => {
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

  const fetchPostsByFilteredMember = (skip, limit, filter, last) => {
    const enabledMemberID = filter[0].options.filter(
      (option) => option.enabled === true
    )[0].data.id;
    setFilteredMember(enabledMemberID);
    const enabledMemberDBRef = db
      .collection(`users/${enabledMemberID}/posts`)
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
            return fetchedPost;
          })
      );
      return Promise.all(postsWithSelector);
    });
    return postsByMembersPromise;
  };

  const fetchPostsOnGroupByMember = (skip, limit, filter, last) => {
    const enabledMemberID = filter[0].options.filter(
      (option) => option.enabled === true
    )[0].data.id;

    const enabledMemberDBRef = db
      .collection(`groups/${groupID}/posts`)
      .where('author.id', '==', enabledMemberID)
      .orderBy('timestamp', 'desc');

    const groupPostsPromise = getPaginatedPostsFromCollectionRef(
      enabledMemberDBRef,
      limit,
      last
    ).then((postsList) => {
      postsList.forEach((fetchedPost) => {
        fetchedPost.hasSelector = 'active-remove';
      });
      return postsList;
    });
    return groupPostsPromise;
  };

  return (
    <>
      <FilterableResults
        fetchResults={
          addOrRemove === ADD
            ? fetchPostsByFilteredMember
            : fetchPostsOnGroupByMember
        }
        limit={10}
        loadingFilter
      >
        <div className="sider-layout">
          <NewFilterMenuWrapper
            getDefaultFilter={
              addOrRemove === ADD ? getMemberFilter : getGroupPostsMemberFilter
            }
            radio={true}
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
            <AddOrRemoveToggle
              addOrRemove={addOrRemove}
              setAddOrRemove={setAddOrRemove}
              ADD={ADD}
              REMOVE={REMOVE}
            />
            {selectedPosts.length > 0 ? (
              <AddOrRemoveConfirmation
                selectedPosts={selectedPosts}
                groupData={groupData}
                addPostsToGroup={addPostsToGroup}
                setResetSelection={setResetSelection}
                addOrRemove={addOrRemove}
                removePostsFromGroup={removePostsFromGroup}
                ADD={ADD}
              />
            ) : null}

            {displaySuccessMessage ? (
              <div className="edit-group-posts-success-message-container">
                <SuccessMessage>
                  {addOrRemove === ADD
                    ? `Posts Added to ${groupData.name}!`
                    : `Posts Removed from ${groupData.name}!`}
                </SuccessMessage>
              </div>
            ) : null}

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
      </FilterableResults>
    </>
  );
}

const AddOrRemoveConfirmation = ({
  selectedPosts,
  groupData,
  addPostsToGroup,
  setResetSelection,
  addOrRemove,
  removePostsFromGroup,
  ADD,
}) => {
  return (
    <div className="edit-group-posts-selected-posts-container">
      {addOrRemove === ADD ? (
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
        {addOrRemove === ADD ? (
          <PrimaryButton onClick={() => addPostsToGroup()}>
            Add to Group
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => removePostsFromGroup()}>
            Remove from Group
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

const AddOrRemoveToggle = ({addOrRemove, setAddOrRemove, ADD, REMOVE}) => {
  return (
    <div className="edit-group-posts-add-or-remove-container">
      <div className="edit-group-posts-add-or-remove-button-container">
        <button
          onClick={() => {
            if (addOrRemove !== ADD) setAddOrRemove(ADD);
          }}
          className={
            addOrRemove === ADD ? 'feed-tab-active' : 'feed-tab-inactive'
          }
        >
          <h3>Add Posts</h3>
        </button>
      </div>
      <div className="edit-group-posts-add-or-remove-button-container">
        <button
          onClick={() => {
            if (addOrRemove !== REMOVE) setAddOrRemove(REMOVE);
          }}
          className={
            addOrRemove === REMOVE ? 'feed-tab-active' : 'feed-tab-inactive'
          }
        >
          <h3>Remove Posts</h3>
        </button>
      </div>
    </div>
  );
};
