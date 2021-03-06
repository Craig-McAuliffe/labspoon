import React, {useContext, useEffect, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../App';
import {convertGroupToGroupRef} from '../../helpers/groups';
import {db} from '../../firebase';

import FollowButton from '../Buttons/FollowButton';
import Popover from '../Popovers/Popover';
import FollowOptionsPopover from '../Popovers/FollowOptionsPopover';
import {GROUP} from '../../helpers/resourceTypeDefinitions';

export default function FollowGroupButton({targetGroup}) {
  const [following, setFollowing] = useState();
  const featureFlags = useContext(FeatureFlags);
  const {user, userProfile} = useContext(AuthContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      setFollowing(false);
      return;
    }
    if (!featureFlags.has('disable-cloud-firestore') && user) {
      db.doc(`users/${user.uid}/followsGroups/${targetGroup.id}`)
        .get()
        .then((doc) => setFollowing(doc.exists))
        .catch((err) => console.log(err));
    }
  });

  function setFollowingAndUpdateDB() {
    if (following == null) return;

    if (!featureFlags.has('disable-cloud-firestore')) {
      const batch = db.batch();
      const followsGroupsDoc = db.doc(
        `users/${user.uid}/followsGroups/${targetGroup.id}`
      );
      const followedByUsersDoc = db.doc(
        `groups/${targetGroup.id}/followedByUsers/${user.uid}`
      );
      if (!following) {
        batch.set(followsGroupsDoc, convertGroupToGroupRef(targetGroup));
        batch.set(followedByUsersDoc, {
          id: user.uid,
          name: user.displayName,
          avatar: userProfile.avatar ? userProfile.avatar : null,
        });
        batch
          .commit()
          .then(() => setFollowing(true))
          .catch((err) => console.log(err));
      } else {
        batch.delete(followsGroupsDoc);
        batch.delete(followedByUsersDoc);
        batch
          .commit()
          .then(() => setFollowing(false))
          .catch((err) => console.log(err));
      }
    }
  }

  const getFollowOptionsPopover = () => (
    <FollowOptionsPopover
      targetResourceData={targetGroup}
      resourceType={GROUP}
    />
  );

  const followButtonComponent = (
    <FollowButton
      following={following}
      setFollowing={setFollowingAndUpdateDB}
      actionAndTriggerPopUp={() => {}}
    />
  );
  if (!userProfile) return followButtonComponent;

  return (
    <Popover
      getPopUpComponent={getFollowOptionsPopover}
      shouldNotOpen={following}
    >
      {followButtonComponent}
    </Popover>
  );
}
