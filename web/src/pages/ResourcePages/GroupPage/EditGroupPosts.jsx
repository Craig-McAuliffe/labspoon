import React, {useState, createContext} from 'react';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
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
  const groupID = groupData.id;
  const membersDBCollectionRef = db.collection(`groups/${groupID}/members`);
  console.log(selectedPosts);

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
    const enabledMemberDBRef = db.collection(`users/${enabledMemberID}/posts`);
    const postsByMembersPromise = getPaginatedPostsFromCollectionRef(
      enabledMemberDBRef,
      limit,
      last
    ).then((postsList) => {
      postsList.forEach((fetchedPost) => {
        fetchedPost.hasSelector = true;
      });
      return postsList;
    });
    return postsByMembersPromise;
  };

  const fetchPostsOnGroup = (skip, limit, filter, last) => {
    const enabledMemberID = filter[0].options.filter(
      (option) => option.enabled === true
    )[0].data.id;
    const enabledMemberDBRef = db
      .collection(`groups/${groupID}/posts`)
      .where('author.id', '==', enabledMemberID);
    const groupPostsPromise = getPaginatedPostsFromCollectionRef(
      enabledMemberDBRef,
      limit,
      last
    ).then((postsList) => {
      postsList.forEach((fetchedPost) => {
        fetchedPost.hasSelector = true;
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
            <div className="edit-group-posts-add-or-remove-container">
              <div className="edit-group-posts-add-or-remove-button-container">
                <button
                  onClick={() => {
                    if (addOrRemove !== 'add') setAddOrRemove('add');
                  }}
                  buttonText=" Add posts"
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
                  inactive={addOrRemove === 'remove' ? false : true}
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
                <div className="edit-group-posts-selected-posts-container">
                  <h2>
                    Add {selectedPosts.length} selected posts to{' '}
                    {groupData.name}
                  </h2>
                  <div className="edit-group-posts-selected-posts-actions">
                    <button>Deselect All</button>
                    <PrimaryButton onClick={() => {}}>
                      Add to Group
                    </PrimaryButton>
                  </div>
                </div>
              ) : null}
            </div>
            <SelectedListItemsContext.Provider value={setSelectedPosts}>
              <NewResultsWrapper />
            </SelectedListItemsContext.Provider>
          </div>
        </div>
      </FilterableResults>
    </>
  );
}

// const readGroupFromDB = () => {
//   for (let i = 0; i < selectedUsers.length; i++) {
//     db.collection(`users/${selectedUsers[i].id}/posts`)
//       .get()
//       .then((fetchedPostsByMember) => {
//         fetchedPostsByMember.forEach((fetchedPostSnapShot) => {
//           const fetchedPostData = fetchedPostSnapShot.data();
//           fetchedPostData.onGroupPage = false;
//           collectedPostsByMembers.push(fetchedPostData);
//         });
//         if (i === selectedUsers.length - 1) writeGroupToDB();
//       })
//       .catch((err) => {
//         console.log(err, 'could not fetch posts by members');
//         alert('Something went worng, please try agian later. (sorry)');
//       });
//   }
// };

// collectedPostsByMembers.forEach((collectedPost) => {
//   batch.set(
//     groupDocRef.collection('posts').doc(collectedPost.id),

//     collectedPost
//   );
// });
