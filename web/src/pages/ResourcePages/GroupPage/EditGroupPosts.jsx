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
  const [addOrRemove, setAddOrRemove] = useState('add');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [filteredMember, setFilteredMember] = useState('');
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [resetSelection, setResetSelection] = useState(false);

  // Resets selection if user switches between member or tabs
  useEffect(() => {
    setSelectedPosts([]);
  }, [filteredMember, addOrRemove]);

  // Deselect posts when successfully adding posts
  useEffect(() => {
    if (displaySuccessMessage) {
      setResetSelection(true);
      setSelectedPosts([]);
      setTimeout(() => {
        setResetSelection(false);
        setFilteredMember(false);
        setDisplaySuccessMessage(false);
      }, 3000);
    }
  }, [displaySuccessMessage]);

  useEffect(() => {
    if (resetSelection) {
      setSelectedPosts([]);
      setTimeout(() => setResetSelection(false), 10);
    }
  }, [resetSelection]);

  const groupID = groupData.id;
  const membersDBCollectionRef = db.collection(`groups/${groupID}/members`);

  async function addPostsToGroup() {
    selectedPosts.forEach((selectedPost) => {
      delete selectedPost.hasSelector;
      db.doc(`groups/${groupID}/posts/${selectedPost.id}`)
        .set(selectedPost)
        .then(() => setDisplaySuccessMessage(true))
        .catch((err) => {
          console.log(err);
          alert(`Sorry, we couldn't add the posts. Please try again later.`);
        });
    });
    setSelectedPosts([]);
  }

  const memberFilter = () => {
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
            enabled: i === 0 ? true : false,
          });
        });
        return filterCollection;
      })
      .catch((err) => console.log('filter err', err));
    filterCollections.push(memberFilterPromise);
    return Promise.all(filterCollections);
  };

  const groupPostsMemberFilter = () => {
    const filterCollections = [];
    const groupPostsMemberFilterRef = db.collection(
      `groups/${groupID}/filterCollections/usersWithPostsOnGroup`
    );
    const memberFilterPromise = db
      .collection(groupPostsMemberFilterRef)
      .get()
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
            enabled: i === 0 ? true : false,
          });
        });
        return filterCollection;
      })
      .catch((err) => console.log('filter err', err));
    filterCollections.push(memberFilterPromise);
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
            fetchedPost.hasSelector = qs.exists ? 'active' : 'inactive';
            return fetchedPost;
          })
      );
      return Promise.all(postsWithSelector);
    });
    return postsByMembersPromise;
  };

  const fetchPostsOnGroup = (skip, limit, filter, last) => {
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
        fetchedPost.hasSelector = 'active';
      });
      return postsList;
    });
    return groupPostsPromise;
  };
  return (
    <>
      <FilterableResults
        fetchResults={
          addOrRemove === 'add' ? fetchPostsByFilteredMember : fetchPostsOnGroup
        }
        limit={10}
        loadingFilter
      >
        <div className="sider-layout">
          <NewFilterMenuWrapper
            getDefaultFilter={
              addOrRemove === 'add' ? memberFilter : groupPostsMemberFilter
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
            <div className="edit-group-posts-add-or-remove-container">
              <div className="edit-group-posts-add-or-remove-button-container">
                <button
                  onClick={() => {
                    if (addOrRemove !== 'add') setAddOrRemove('add');
                  }}
                  className={
                    addOrRemove === 'add'
                      ? 'feed-tab-active'
                      : 'feed-tab-inactive'
                  }
                >
                  <h3>Add Posts</h3>
                </button>
              </div>
              <div className="edit-group-posts-add-or-remove-button-container">
                <button
                  onClick={() => {
                    if (addOrRemove !== 'remove') setAddOrRemove('remove');
                  }}
                  className={
                    addOrRemove === 'remove'
                      ? 'feed-tab-active'
                      : 'feed-tab-inactive'
                  }
                >
                  <h3>Remove Posts</h3>
                </button>
              </div>
              {selectedPosts.length > 0 ? (
                <AddOrRemoveConfirmation
                  selectedPosts={selectedPosts}
                  groupData={groupData}
                  addPostsToGroup={addPostsToGroup}
                  setResetSelection={setResetSelection}
                />
              ) : null}
            </div>

            {displaySuccessMessage ? (
              <div className="edit-group-posts-success-message-container">
                <SuccessMessage>
                  Posts Added to {groupData.name}!
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
}) => {
  return (
    <div className="edit-group-posts-selected-posts-container">
      <h2>
        Add {selectedPosts.length} selected posts to {groupData.name}
      </h2>
      <div className="edit-group-posts-selected-posts-actions">
        <button onClick={() => setResetSelection(true)}>Deselect All</button>
        <PrimaryButton onClick={() => addPostsToGroup()}>
          Add to Group
        </PrimaryButton>
      </div>
    </div>
  );
};
