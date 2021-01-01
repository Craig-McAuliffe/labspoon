import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../../App';
import {db} from '../../firebase';

import FollowButton from '../Buttons/FollowButton';

export default function FollowTopicButton({targetTopic}) {
  const [following, setFollowing] = useState(null);
  const [topicID, setTopicID] = useState();
  const {user: authUser, userProfile} = useContext(AuthContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!authUser) {
      setFollowing(false);
      return;
    }
    if (!targetTopic.id && !topicID) {
      db.doc(`MSFields/${targetTopic.microsoftID}`)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            setFollowing(false);
            return;
          }
          const fetchedMSTopic = doc.data();
          if (fetchedMSTopic.processed) {
            setTopicID(fetchedMSTopic.processed);
          }
        });
    }
    if (!topicID && !targetTopic.id) return;

    db.doc(
      `users/${authUser.uid}/followsTopics/${
        targetTopic.id ? targetTopic.id : topicID
      }`
    )
      .get()
      .then((doc) => {
        setFollowing(doc.exists);
        if (!topicID) setTopicID(doc.id);
      })
      .catch((err) => console.error(err));
  }, [authUser, targetTopic, topicID]);

  function setFollowingAndUpdateDB() {
    if (!authUser) return;
    if (!topicID) {
      db.doc(`MSFields/${targetTopic.microsoftID}`)
        .get()
        .then((doc) => {
          if (!doc.exists) return;
          const fetchedMSTopic = doc.data();
          if (fetchedMSTopic.processed) {
            topicSubmitFollowRequest(
              fetchedMSTopic.processed,
              targetTopic.name,
              setFollowing,
              following,
              authUser,
              userProfile
            );
            return;
          }
          return;
        })
        .catch((err) => console.log(err));
      return;
    }
    return topicSubmitFollowRequest(
      topicID,
      targetTopic.name,
      setFollowing,
      following,
      authUser,
      userProfile
    );
  }

  return (
    <FollowButton
      following={following}
      setFollowing={setFollowingAndUpdateDB}
    />
  );
}

function topicSubmitFollowRequest(
  topicID,
  topicName,
  setFollowing,
  following,
  authUser,
  userProfile
) {
  const batch = db.batch();
  const followsTopicsDoc = db.doc(
    `users/${authUser.uid}/followsTopics/${topicID}`
  );
  const followedByUsersDoc = db.doc(
    `topics/${topicID}/followedByUsers/${authUser.uid}`
  );
  if (!following) {
    batch.set(followsTopicsDoc, {
      id: topicID,
      name: topicName,
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
