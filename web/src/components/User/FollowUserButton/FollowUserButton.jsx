import React, {useContext, useEffect, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../../App';
import {db} from '../../../firebase';

import FollowButton from '../../Buttons/FollowButton';

export default function FollowUserButton({targetUser}) {
  const [following, setFollowing] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const {user: authUser, userProfile} = useContext(AuthContext);

  useEffect(() => {
    if (!targetUser.id) return;
    if (!featureFlags.has('disable-cloud-firestore') && authUser) {
      db.doc(`users/${authUser.uid}/followsUsers/${targetUser.id}`)
        .get()
        .then((doc) => setFollowing(doc.exists))
        .catch((err) => console.log(err));
    }
  });

  function setFollowingAndUpdateDB() {
    if (!featureFlags.has('disable-cloud-firestore')) {
      const batch = db.batch();
      const followsUsersDoc = db.doc(
        `users/${authUser.uid}/followsUsers/${targetUser.id}`
      );
      const followedByUsersDoc = db.doc(
        `users/${targetUser.id}/followedByUsers/${authUser.uid}`
      );
      if (!following) {
        batch.set(followsUsersDoc, {
          id: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
        });
        batch.set(followedByUsersDoc, {
          id: authUser.uid,
          name: authUser.displayName,
          avatar: userProfile.avatar,
        });
        batch
          .commit()
          .then(() => setFollowing(true))
          .catch((err) => console.log(err));
      } else {
        batch.delete(followsUsersDoc);
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
