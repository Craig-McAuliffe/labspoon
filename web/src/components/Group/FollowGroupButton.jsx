import React, {useContext, useEffect, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../App';
import {convertGroupToGroupRef} from '../../helpers/groups';
import {db} from '../../firebase';

import FollowButton from '../Buttons/FollowButton';

export default function FollowGroupButton({targetGroup}) {
  const [following, setFollowing] = useState();
  const featureFlags = useContext(FeatureFlags);
  const {user: authUser, userProfile} = useContext(AuthContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!authUser) {
      setFollowing(false);
      return;
    }
    if (!featureFlags.has('disable-cloud-firestore') && authUser) {
      db.doc(`users/${authUser.uid}/followsGroups/${targetGroup.id}`)
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
        `users/${authUser.uid}/followsGroups/${targetGroup.id}`
      );
      const followedByUsersDoc = db.doc(
        `groups/${targetGroup.id}/followedByUsers/${authUser.uid}`
      );
      if (!following) {
        batch.set(followsGroupsDoc, convertGroupToGroupRef(targetGroup));
        batch.set(followedByUsersDoc, {
          id: authUser.uid,
          name: authUser.displayName,
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

  return (
    <FollowButton
      following={following}
      setFollowing={setFollowingAndUpdateDB}
    />
  );
}
