import React from 'react';
import FilteredSelector, {
  ADD,
  REMOVE,
} from '../../../components/FilteredSelector/FilteredSelector';
import {
  getActiveTabID,
  getEnabledIDsFromFilter,
  usersToFilterOptions,
} from '../../../helpers/filters';
import {
  jsPublicationToDBPublication,
  getPaginatedPublicationsFromCollectionRef,
} from '../../../helpers/publications';
import {db} from '../../../firebase';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';

const GROUP_MEMBERS = 'Group Members';

export default function EditGroupPublications({children, groupID}) {
  function fetchItems(selectedItems, skip, limit, filter, last) {
    if (!filter) return [[], null];

    const userID = getEnabledUserID(filter);
    if (!userID) return [[], null];

    let results = [];
    switch (getActiveTabID(filter)) {
      case ADD:
        results = fetchPublicationsForMember(limit, last, groupID, userID);
        break;
      case REMOVE:
        results = fetchPublicationsOnGroupForMember(
          limit,
          last,
          groupID,
          userID
        );
        break;
      default:
    }
    return [results, null];
  }

  function getDefaultFilter(filter) {
    if (!filter) return [];
    const activeTab = getActiveTabID(filter);
    if (activeTab === REMOVE) return getGroupPublicationsAuthorsFilter(groupID);
    return getMemberFilter(groupID);
  }

  const addSelected = (selectedItems, resetSelection, setSuccess) =>
    addPublicationsToGroup(groupID, selectedItems, resetSelection, setSuccess);

  const removeSelected = (selectedItems, resetSelection, setSuccess) =>
    removePublicationsFromGroup(
      groupID,
      selectedItems,
      resetSelection,
      setSuccess
    );

  return (
    <FilteredSelector
      fetchItems={fetchItems}
      getDefaultFilter={getDefaultFilter}
      addSelected={addSelected}
      removeSelected={removeSelected}
    >
      {children}
    </FilteredSelector>
  );
}

function getEnabledUserID(filter) {
  if (!filter) return undefined;
  const enabledIDs = getEnabledIDsFromFilter(filter);
  if (!enabledIDs || !enabledIDs.has(GROUP_MEMBERS)) return undefined;
  const enabledUserID = enabledIDs.get(GROUP_MEMBERS)[0];
  return enabledUserID;
}

async function fetchPublicationsForMember(limit, last, groupID, userID) {
  const publicationsRef = db.collection(`users/${userID}/publications`);
  const publications = await getPaginatedPublicationsFromCollectionRef(
    publicationsRef,
    limit,
    last
  );
  const taggedPublications = publications.map((publication) =>
    tagPublicationIfPresentOnGroup(publication.id, groupID, publication)
  );
  return await Promise.all(taggedPublications);
}

async function tagPublicationIfPresentOnGroup(
  publicationID,
  groupID,
  publication
) {
  return await db
    .doc(`groups/${groupID}/publications/${publicationID}`)
    .get()
    .then((ds) => {
      if (ds.exists) publication._alreadyPresent = true;
      return publication;
    });
}

function fetchPublicationsOnGroupForMember(limit, last, groupID, userID) {
  const publicationsRef = db
    .collection(`groups/${groupID}/publications`)
    .where('authorIDs', 'array-contains', userID);
  return getPaginatedPublicationsFromCollectionRef(
    publicationsRef,
    limit,
    last
  );
}

async function getGroupPublicationsAuthorsFilter(groupID) {
  const authorFilterOptions = await getPaginatedUserReferencesFromCollectionRef(
    db.collection(
      `groups/${groupID}/feeds/publicationsFeed/filterCollections/user/filterOptions`
    ),
    20
  );
  const authorsFilterGroup = {
    collectionName: 'Group Members',
    options: usersToFilterOptions(authorFilterOptions, true),
    mutable: true,
  };
  return [authorsFilterGroup];
}

async function getMemberFilter(groupID) {
  const membersRef = db.collection(`groups/${groupID}/members`);
  const members = await getPaginatedUserReferencesFromCollectionRef(
    membersRef,
    20
  );
  const membersFilterGroup = {
    collectionName: 'Group Members',
    options: usersToFilterOptions(members),
    mutable: true,
  };
  return [membersFilterGroup];
}

async function addPublicationsToGroup(
  groupID,
  selectedPublications,
  resetSelection,
  setSuccess
) {
  const writePromises = selectedPublications.map((publication) => {
    const authorIDs = publication.authors
      .map((author) => author.id)
      .filter(Boolean);
    publication.authorIDs = authorIDs;
    delete publication._alreadyPresent;
    return db
      .doc(`groups/${groupID}/publications/${publication.id}`)
      .set(jsPublicationToDBPublication(publication))
      .catch((err) => {
        console.error('Could not add publication to group:', err);
        alert('Something went wrong. Try again later.');
      });
  });
  await Promise.all(writePromises);
  resetSelection();
  setSuccess(true);
}

async function removePublicationsFromGroup(
  groupID,
  selectedPublications,
  resetSelection,
  setSuccess
) {
  const deletionPromises = selectedPublications.map((selectedPublication) =>
    db
      .doc(`groups/${groupID}/publications/${selectedPublication.id}`)
      .delete()
      .catch((err) => {
        console.error('Could not remove publication from group:', err);
        alert('Something went wrong. Try again later.');
      })
  );
  await Promise.all(deletionPromises);
  resetSelection();
  setSuccess(true);
}
