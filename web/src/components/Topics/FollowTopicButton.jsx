import React, {useContext, useEffect, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../App';
import {db} from '../../firebase';

import FollowButton from '../Buttons/FollowButton';

export default function FollowTopicButton({targetTopic}) {
  const [following, setFollowing] = useState();
  const featureFlags = useContext(FeatureFlags);
  const {user: authUser, userProfile} = useContext(AuthContext);
  useEffect(() => {
    if (!featureFlags.has('disable-cloud-firestore') && authUser) {
      db.doc(`users/${authUser.uid}/followsTopics/${targetTopic.id}`)
        .get()
        .then((doc) => setFollowing(doc.exists))
        .catch((err) => console.log(err));
    }
  });

  function setFollowingAndUpdateDB() {
    if (following == null) return;

    const batch = db.batch();
    const followsTopicsDoc = db.doc(
      `users/${authUser.uid}/followsTopics/${targetTopic.id}`
    );
    const followedByUsersDoc = db.doc(
      `topics/${targetTopic.id}/followedByUsers/${authUser.uid}`
    );
    if (!following) {
      batch.set(followsTopicsDoc, {
        id: targetTopic.id,
        name: targetTopic.name,
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
      batch.delete(followsTopicsDoc);
      batch.delete(followedByUsersDoc);
      batch
        .commit()
        .then(() => setFollowing(false))
        .catch((err) => console.log(err));
    }
  }

  return (
    <FollowButton
      following={following}
      setFollowing={setFollowingAndUpdateDB}
    />
  );
}
