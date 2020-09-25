import React, {useContext, useEffect, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../App';
import {db} from '../../firebase';

import FollowButton from '../Buttons/FollowButton';

export default function FollowGroupButton({targetGroup}) {
  const [following, setFollowing] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const {user: authUser} = useContext(AuthContext);

  useEffect(() => {
    if (!featureFlags.has('disable-cloud-firestore') && authUser) {
      db.doc(`users/${authUser.uid}/followsGroups/${targetGroup.id}`)
        .get()
        .then((doc) => setFollowing(doc.exists))
        .catch((err) => console.log(err));
    }
  });

  function setFollowingAndUpdateDB() {
    if (!featureFlags.has('disable-cloud-firestore')) {
      const batch = db.batch();
      const followsGroupsDoc = db.doc(
        `users/${authUser.uid}/followsGroups/${targetGroup.id}`
      );
      const followedByUsersDoc = db.doc(
        `groups/${targetGroup.id}/followedByUsers/${authUser.uid}`
      );
      if (!following) {
        batch.set(followsGroupsDoc, {
          id: targetGroup.id,
          name: targetGroup.name,
        });
        batch.set(followedByUsersDoc, {
          id: authUser.uid,
          name: authUser.displayName,
          // TODO(#104) Update this with the user avatar when made available.
          // avatar: authUser.avatar,
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
