import React from 'react';
import FilteredSelector, {
  ADD,
  REMOVE,
} from '../../../components/FilteredSelector/FilteredSelector';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import {
  getActiveTabID,
  getEnabledIDsFromFilter,
  usersToFilterOptions,
} from '../../../helpers/filters';

import {db} from '../../../firebase';

import './GroupPage.css';
import {convertGroupToGroupRef} from '../../../helpers/groups';

export default function EditGroupPosts({children, groupID, group}) {
  function fetchItems(selected, skip, limit, filter, last) {
    const activeTab = filter ? getActiveTabID(filter) : null;
    switch (activeTab) {
      case ADD:
        return [fetchPostsByFilteredMember(limit, filter, last, groupID), null];
      case REMOVE:
        return [
          fetchPostsOnGroupByFilteredMember(
            limit,
            filter,
            last,
            groupID,
            selected
          ),
          null,
        ];
      default:
        return [[], null];
    }
  }

  function getDefaultFilter(filter) {
    const activeTab = filter ? getActiveTabID(filter) : null;
    return activeTab === REMOVE
      ? getGroupPostsAuthorsFilter(groupID)
      : getMemberFilter(groupID);
  }

  function addPostsToGroup(selectedItems, resetSelection, setSuccess) {
    selectedItems.forEach((selectedPost) => {
      delete selectedPost._alreadyPresent;
      const batch = db.batch();
      batch.set(
        db.doc(`groups/${groupID}/posts/${selectedPost.id}`),
        selectedPost
      );
      batch.set(
        db.doc(`posts/${selectedPost.id}/groups/${groupID}`),
        convertGroupToGroupRef(group)
      );
      batch
        .commit()
        .then(() => {
          resetSelection();
          setSuccess(true);
        })
        .catch((err) => {
          console.log(err);
          alert(`Sorry, something went wrong. Please try again later.`);
        });
    });
  }

  function removePostsFromGroup(selectedItems, resetSelection, setSuccess) {
    selectedItems.forEach((selectedPost) => {
      const batch = db.batch();

      batch.delete(db.doc(`groups/${groupID}/posts/${selectedPost.id}`));
      batch.delete(db.doc(`posts/${selectedPost.id}/groups/${groupID}`));
      batch
        .commit()
        .then(() => {
          resetSelection();
          setSuccess(true);
        })
        .catch((err) => {
          console.log(err);
          alert(`Sorry, something went wrong. Please try again later.`);
        });
    });
  }

  return (
    <FilteredSelector
      fetchItems={fetchItems}
      getDefaultFilter={getDefaultFilter}
      addSelected={addPostsToGroup}
      removeSelected={removePostsFromGroup}
    >
      {children}
    </FilteredSelector>
  );
}

export const fetchPostsByFilteredMember = (limit, filter, last, groupID) => {
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
          if (qs.exists) fetchedPost._alreadyPresent = true;
          return fetchedPost;
        })
    );
    return Promise.all(postsWithSelector);
  });
  return postsByMembersPromise;
};

export const fetchPostsOnGroupByFilteredMember = (
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

export const getMemberFilter = (groupID) => {
  const membersDBCollectionRef = db.collection(`groups/${groupID}/members`);
  const filterCollections = [];
  const memberFilterPromise = getPaginatedUserReferencesFromCollectionRef(
    membersDBCollectionRef,
    20
  )
    .then((fetchedMembers) => ({
      collectionName: 'Group Members',
      options: usersToFilterOptions(fetchedMembers),
      mutable: true,
    }))
    .catch((err) => console.log('filter err', err));
  filterCollections.push(memberFilterPromise);
  return Promise.all(filterCollections);
};

export const getGroupPostsAuthorsFilter = (groupID) => {
  const filterCollections = [];
  const postUserFilterRef = db.collection(
    `groups/${groupID}/feeds/postsFeed/filterCollections/user/filterOptions`
  );
  const postUserFilterPromise = getPaginatedUserReferencesFromCollectionRef(
    postUserFilterRef,
    20
  )
    .then((fetchedMembers) => ({
      collectionName: 'Group Members',
      options: usersToFilterOptions(fetchedMembers, true),
      mutable: true,
    }))
    .catch((err) => console.log('filter err', err));
  filterCollections.push(postUserFilterPromise);
  return Promise.all(filterCollections);
};
