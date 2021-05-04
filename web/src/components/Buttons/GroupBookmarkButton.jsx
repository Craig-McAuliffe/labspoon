import React, {useState, useContext, useEffect} from 'react';
import {AuthContext} from '../../App';
import {GroupBookmarkIcon} from '../../assets/PostActionIcons';
import {db} from '../../firebase';
import {getPostListItemFromPost} from '../../helpers/posts';
import {
  POST,
  resourceTypeToCollection,
} from '../../helpers/resourceTypeDefinitions';
import {GroupDropdownItem} from '../Group/GroupListItem';
import Popover from '../Popovers/Popover';
import './GroupBookmarkButton.css';

export default function GroupBookmarkButton({
  bookmarkedResource,
  bookmarkedResourceType,
  bookmarkedResourceID,
  backgroundShade,
}) {
  const [submitting, setSubmitting] = useState(false);
  const {userProfile} = useContext(AuthContext);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(async () => {
    if (!userProfile) return;
    const groupsForUserQS = await db
      .collection(`users/${userProfile.id}/groups`)
      .get()
      .catch((err) =>
        console.error(
          `unable to fetch groups for user with id ${userProfile.id} ${err}`
        )
      );
    if (!groupsForUserQS || groupsForUserQS.empty) return;
    const groupsData = [];
    groupsForUserQS.forEach((groupDS) => {
      const groupData = groupDS.data();
      groupData.id = groupDS.id;
      groupsData.push(groupData);
    });
    setUserGroups(groupsData);
    setLoadingGroups(false);
  }, [userProfile]);

  const onBookmark = async (groupID, addOrRemove) => {
    if (submitting) return;
    setSubmitting(true);
    const bookmarkListItem = getListItemFromGenericResource(
      bookmarkedResourceType,
      bookmarkedResource,
      bookmarkedResourceID
    );
    const batch = db.batch();
    const groupBookmarkRef = db.doc(
      `groups/${groupID}/bookmarks/${bookmarkedResourceID}`
    );
    const bookmarkedResourceRef = db.doc(
      `${resourceTypeToCollection(
        bookmarkedResourceType
      )}/${bookmarkedResourceID}/bookmarkedByGroups/${groupID}`
    );

    if (addOrRemove === 'add') {
      batch.set(groupBookmarkRef, bookmarkListItem);
      batch.set(bookmarkedResourceRef, {id: groupID});
    } else {
      batch.delete(groupBookmarkRef);
      batch.delete(bookmarkedResourceRef);
    }
    await batch
      .commit()
      .catch((err) =>
        console.error(
          `unable to group bookmark ${bookmarkedResourceType} with id ${bookmarkedResourceID} to group ${groupID} ${err}`
        )
      );
    setSubmitting(false);
  };
  if (loadingGroups) return null;
  return (
    <div className="group-bookmark-container">
      <Popover
        getPopUpComponent={(setOpen) => (
          <GetAndDisplayGroupsForUser
            userID={userProfile.id}
            onSelect={onBookmark}
            groups={userGroups}
            setOpen={setOpen}
            bookmarkedResourceID={bookmarkedResourceID}
          />
        )}
        hasOwnRelativeContainer={true}
      >
        <GroupBookmarkButtonContent
          actionAndTriggerPopUp={() => {}}
          backgroundShade={backgroundShade}
        />
      </Popover>
    </div>
  );
}

function GetAndDisplayGroupsForUser({
  userID,
  onSelect,
  groups,
  setOpen,
  bookmarkedResourceID,
}) {
  const [loadingGroupBookmarkState, setLoadingGroupBookmarkState] = useState(
    true
  );
  const [bookmarkedGroupsIDs, setBookmarkedGroupsIDs] = useState([]);
  console.log(bookmarkedGroupsIDs);
  useEffect(async () => {
    const groupsBookmarksPromises = groups.map((group) =>
      db
        .doc(`groups/${group.id}/bookmarks/${bookmarkedResourceID}`)
        .get()
        .then((ds) => {
          if (ds.exists) return group.id;
          return false;
        })
        .catch((err) => console.error(err))
    );
    const groupsThatHaveBookmarkedIDs = await Promise.all(
      groupsBookmarksPromises
    );
    const filteredGroupIDs = groupsThatHaveBookmarkedIDs.filter(
      (groupID) => groupID
    );
    setBookmarkedGroupsIDs(filteredGroupIDs);
    setLoadingGroupBookmarkState(false);
  }, [groups]);

  if (!userID || !groups) return null;

  return (
    <div
      className={`group-bookmark-button-groups-popover${
        loadingGroupBookmarkState ? '-loading' : ''
      }`}
    >
      <h3 className="group-bookmark-button-groups-popover-title">
        Choose group
      </h3>
      {groups.map((group) => (
        <button
          className="group-bookmark-button-group-selector"
          onClick={() => {
            if (loadingGroupBookmarkState) return;
            setOpen(false);
            if (bookmarkedGroupsIDs.some((groupID) => groupID === group.id))
              return onSelect(group.id, 'remove');
            return onSelect(group.id, 'bookmark');
          }}
          key={group.id}
        >
          <GroupDropdownItem group={group}>
            <p>
              {bookmarkedGroupsIDs.some((groupID) => groupID === group.id)
                ? 'Remove'
                : 'Bookmark'}
            </p>
          </GroupDropdownItem>
        </button>
      ))}
    </div>
  );
}

function GroupBookmarkButtonContent({actionAndTriggerPopUp, backgroundShade}) {
  return (
    <button
      className={`action-button-${
        backgroundShade ? backgroundShade : 'light'
      }-unselected
      }`}
      href="/"
      onClick={actionAndTriggerPopUp}
    >
      <GroupBookmarkIcon />
      <span className="action-button-text">Group Bookmark</span>
    </button>
  );
}
export function getListItemFromGenericResource(
  resourceType,
  resourceData,
  resourceID
) {
  switch (resourceType) {
    case POST:
      return getPostListItemFromPost(resourceData);
    default:
      return getPostListItemFromPost(resourceData);
  }
}
