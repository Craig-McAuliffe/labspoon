import React, {useState, useContext, useEffect} from 'react';
import {useLocation} from 'react-router';
import {AuthContext} from '../../App';
import {GroupBookmarkIcon} from '../../assets/PostActionIcons';
import {db} from '../../firebase';
import {getPostListItemFromPost} from '../../helpers/posts';
import {
  POST,
  resourceTypeToCollection,
} from '../../helpers/resourceTypeDefinitions';
import {FilterableResultsContext} from '../FilterableResults/FilterableResults';
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
  const pathname = useLocation().pathname;
  const filterableResultsContext = useContext(FilterableResultsContext);
  bookmarkedResource.bookmarkTimestamp = new Date();
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

  const onBookmark = async (groupID, bookmarkOrRemove) => {
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

    if (bookmarkOrRemove === 'bookmark') {
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
    // refreshes feed on memberZone bookmarks upon bookmark change
    if (pathname.includes('memberZone')) {
      if (filterableResultsContext)
        filterableResultsContext.setChildrenRefreshFeedToggle(
          (toggleState) => !toggleState
        );
    }
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
            backgroundShade={backgroundShade}
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
  backgroundShade,
}) {
  const [loadingGroupBookmarkState, setLoadingGroupBookmarkState] = useState(
    true
  );
  const [bookmarkedGroupsIDs, setBookmarkedGroupsIDs] = useState([]);
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
      className={`group-bookmark-button-groups-popover-${
        backgroundShade ? backgroundShade : 'light'
      }${loadingGroupBookmarkState ? '-loading' : ''}`}
    >
      <h3
        className={`group-bookmark-button-groups-popover-title-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        Choose group
      </h3>
      {groups.map((group) => {
        const groupIsBookmarked = bookmarkedGroupsIDs.some(
          (groupID) => groupID === group.id
        );
        return (
          <button
            className={`group-bookmark-button-group-selector-${
              backgroundShade ? backgroundShade : 'light'
            }${groupIsBookmarked ? '-bookmarked' : ''}`}
            onClick={() => {
              if (loadingGroupBookmarkState) return;
              setOpen(false);
              if (groupIsBookmarked) return onSelect(group.id, 'remove');
              return onSelect(group.id, 'bookmark');
            }}
            key={group.id}
          >
            <GroupDropdownItem group={group}>
              <p>{groupIsBookmarked ? 'Remove' : 'Bookmark'}</p>
            </GroupDropdownItem>
          </button>
        );
      })}
    </div>
  );
}

function GroupBookmarkButtonContent({actionAndTriggerPopUp, backgroundShade}) {
  return (
    <div className="post-actions-button-container">
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
    </div>
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
