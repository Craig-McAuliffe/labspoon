import React from 'react';
import FilteredSelector, {
  ADD,
  REMOVE,
} from '../../../components/FilteredSelector/FilteredSelector';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import {
  getPaginatedPostsFromCollectionRef,
  getPostListItemFromPost,
} from '../../../helpers/posts';
import {
  getActiveTabID,
  getEnabledIDsFromFilter,
  usersToFilterOptions,
} from '../../../helpers/filters';
import {db} from '../../../firebase';
import {convertGroupToGroupRef} from '../../../helpers/groups';

import './GroupPage.css';

export default function EditGroupPosts({children, groupID, group}) {
  function fetchItems(skip, limit, filter, last) {
    const activeTab = filter ? getActiveTabID(filter) : null;
    switch (activeTab) {
      case ADD:
        return [fetchPostsByFilteredMember(limit, filter, last, groupID), null];
      case REMOVE:
        return [
          fetchPostsOnGroupByFilteredMember(limit, filter, last, groupID),
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
      const batch = db.batch();
      batch.set(
        db.doc(`groups/${groupID}/posts/${selectedPost.id}`),
        getPostListItemFromPost(selectedPost)
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
          alert(
            `Sorry, something went wrong. Please try again. If the issue persists, email help@labspoon.com .`
          );
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
          alert(
            `Sorry, something went wrong. Please try again. If the issue persists, email help@labspoon.com .`
          );
        });
    });
  }

  return (
    <FilteredSelector
      fetchItems={fetchItems}
      getDefaultFilter={getDefaultFilter}
      addSelected={addPostsToGroup}
      removeSelected={removePostsFromGroup}
      customEndMessage="This group member does not have any more posts. Try another."
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
  groupID
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
      options: usersToFilterOptions(fetchedMembers),
      mutable: true,
    }))
    .catch((err) => console.log('filter err', err));
  filterCollections.push(postUserFilterPromise);
  return Promise.all(filterCollections);
};
