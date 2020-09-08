import React, {useContext, useEffect, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../../App';
import {db} from '../../../firebase';

import FollowButton from '../../Buttons/FollowButton';

export default function FollowUserButton({pageUser}) {
  const [following, setFollowing] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const authUser = useContext(AuthContext);

  useEffect(() => {
    if (featureFlags.has('cloud-firestore')) {
      db.doc(`users/${authUser.uid}/followsUsers/${pageUser.id}`)
        .get()
        .then((doc) => setFollowing(doc.exists))
        .catch((err) => console.log(err));
    }
  });

  function setFollowingAndUpdateDB() {
    if (featureFlags.has('cloud-firestore')) {
      const batch = db.batch();
      const followsUsersDoc = db.doc(
        `users/${authUser.uid}/followsUsers/${pageUser.id}`
      );
      const followedByUsersDoc = db.doc(
        `users/${pageUser.id}/followedByUsers/${authUser.uid}`
      );
      if (!following) {
        batch.set(followsUsersDoc, {
          id: pageUser.id,
          name: pageUser.name,
          avatar: pageUser.avatar,
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
