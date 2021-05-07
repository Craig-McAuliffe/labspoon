import React, {useContext, useEffect, useState} from 'react';
import {Redirect, useHistory, useParams} from 'react-router';
import {AuthContext} from '../../../App';
import {PaddedContent} from '../../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {db} from '../../../firebase';
import {getActiveTabID} from '../../../helpers/filters';
import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {BOOKMARK} from '../../../helpers/resourceTypeDefinitions';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import ResourcesFeed from '../ResourcesFeeds';

import './GroupMemberZone.css';

export default function GroupMemberZone({}) {
  const groupID = useParams().groupID;
  const [
    checkingIfUserIsMemberOfGroup,
    setCheckingIfUserIsMemberOfGroup,
  ] = useState(true);
  const [userIsMemberOfGroup, setUserIsMemberOfGroup] = useState(false);
  const {user} = useContext(AuthContext);
  useEffect(async () => {
    if (!user || !groupID) return;
    const userMemberDS = await db
      .doc(`groups/${groupID}/members/${user.uid}`)
      .get()
      .catch((err) =>
        console.error(
          `unable to fetch member with id ${user.uid} of group with id ${groupID} ${err})`
        )
      );
    if (userMemberDS && userMemberDS.exists) setUserIsMemberOfGroup(true);
    setCheckingIfUserIsMemberOfGroup(false);
  }, [groupID, user]);

  const fetchTabs = () => {
    return [
      {
        collectionName: 'Relationship Types',
        options: [
          {
            enabled: true,
            data: {
              id: 'bookmarks',
              name: 'Bookmarks',
            },
          },
        ],
      },
    ];
  };
  function fetchBookmarks(uuid, skip, limit, filter, last) {
    const activeTab = filter ? getActiveTabID(filter) : null;
    let results;
    switch (activeTab) {
      default:
        const groupBookmarksCollectionRef = db.collection(
          `groups/${groupID}/bookmarks`
        );

        results = getPaginatedResourcesFromCollectionRef(
          groupBookmarksCollectionRef,
          limit,
          last,
          BOOKMARK
        );
        break;
    }
    return [results, null, null];
  }

  const fetchResults = (skip, limit, filter, last) =>
    fetchBookmarks(user.uid, skip, limit, filter, last);

  if (checkingIfUserIsMemberOfGroup) return <LoadingSpinnerPage />;
  if (!groupID) return <NotFoundPage />;
  if (!userIsMemberOfGroup) return <Redirect to={`group/${groupID}`} />;
  return (
    <ResourcesFeed fetchResults={fetchResults} limit={15} tabs={fetchTabs()}>
      <PaddedContent>
        <GroupMemberZoneDetails groupID={groupID} />
      </PaddedContent>
    </ResourcesFeed>
  );
}

function GroupMemberZoneDetails({groupID}) {
  const history = useHistory();
  return (
    <div>
      <div className="member-zone-back-to-public-button-container">
        <button onClick={() => history.push(`/group/${groupID}`)}>
          <h3>Back to Public View</h3>
        </button>
      </div>
      <h1 className="member-zone-back-title">Member Zone</h1>
    </div>
  );
}
