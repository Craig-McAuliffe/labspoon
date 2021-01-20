import React, {useState} from 'react';
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
import {convertGroupToGroupRef} from '../../../helpers/groups';

const GROUP_MEMBERS = 'Group Members';

export default function EditGroupPublications({children, groupID, groupData}) {
  const [errorCount, setErrorCount] = useState(0);
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
    addPublicationsToGroup(
      groupID,
      selectedItems,
      resetSelection,
      setSuccess,
      setErrorCount,
      errorCount,
      groupData
    );

  const removeSelected = (selectedItems, resetSelection, setSuccess) =>
    removePublicationsFromGroup(
      groupID,
      selectedItems,
      resetSelection,
      setSuccess,
      setErrorCount,
      errorCount
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
    .where('filterAuthorIDs', 'array-contains', userID);
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
    options: usersToFilterOptions(authorFilterOptions),
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
  setSuccess,
  setErrorCount,
  errorCount,
  groupData
) {
  setErrorCount(0);
  const writePromises = selectedPublications.map((publication) => {
    delete publication._alreadyPresent;
    const batch = db.batch();
    batch.set(
      db.doc(`groups/${groupID}/publications/${publication.id}`),
      jsPublicationToDBPublication(publication)
    );
    batch.set(
      db.doc(`publications/${publication.id}/groups/${groupID}`),
      convertGroupToGroupRef(groupData)
    );
    return batch.commit().catch((err) => {
      console.error('Could not add publication to group:', err);
      alert(
        'Something went wrong. Please try again and contact help@labspoon.com if the problem persists.'
      );
      setErrorCount((count) => count + 1);
    });
  });
  await Promise.all(writePromises);
  resetSelection();
  if (errorCount > 0) return;
  setSuccess(true);
}

async function removePublicationsFromGroup(
  groupID,
  selectedPublications,
  resetSelection,
  setSuccess,
  setErrorCount,
  errorCount
) {
  setErrorCount(0);
  const deletionPromises = selectedPublications.map((selectedPublication) => {
    const batch = db.batch();
    batch.delete(
      db.doc(`groups/${groupID}/publications/${selectedPublication.id}`)
    );
    batch.delete(
      db.doc(`publications/${selectedPublication.id}/groups/${groupID}`)
    );
    return batch.commit().catch((err) => {
      console.error('Could not remove publication from group:', err);
      alert('Something went wrong. Try again later.');
      setErrorCount((count) => count + 1);
    });
  });
  await Promise.all(deletionPromises);
  resetSelection();
  if (errorCount > 0) return;
  setSuccess(true);
}
