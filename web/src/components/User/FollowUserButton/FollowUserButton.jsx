import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../../../App';
import {db} from '../../../firebase';
import {USER} from '../../../helpers/resourceTypeDefinitions';
import FollowButton from '../../Buttons/FollowButton';
import FollowOptionsPopover from '../../Popovers/FollowOptionsPopover';
import Popover from '../../Popovers/Popover';

export default function FollowUserButton({backgroundShade, targetUser}) {
  const [following, setFollowing] = useState();
  const {user, userProfile, authLoaded} = useContext(AuthContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!authLoaded) return;
    if (!targetUser.id) return;
    if (!user) {
      setFollowing(false);
      return;
    }
    if (user) {
      db.doc(`users/${user.uid}/followsUsers/${targetUser.id}`)
        .get()
        .then((doc) => setFollowing(doc.exists))
        .catch((err) => console.log(err));
    }
  });

  function setFollowingAndUpdateDB() {
    if (following === null) return;
    if (!userProfile) return;
    const batch = db.batch();
    const followsUsersDoc = db.doc(
      `users/${user.uid}/followsUsers/${targetUser.id}`
    );
    const followedByUsersDoc = db.doc(
      `users/${targetUser.id}/followedByUsers/${user.uid}`
    );
    if (!following) {
      batch.set(followsUsersDoc, {
        id: targetUser.id,
        name: targetUser.name,
        avatar: targetUser.avatar ? targetUser.avatar : null,
      });
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
      batch.delete(followsUsersDoc);
      batch.delete(followedByUsersDoc);
      batch
        .commit()
        .then(() => setFollowing(false))
        .catch((err) => console.log(err));
    }
  }

  const getFollowOptionsPopover = () => (
    <FollowOptionsPopover targetResourceData={targetUser} resourceType={USER} />
  );

  const followButtonComponent = (
    <FollowButton
      following={following}
      setFollowing={setFollowingAndUpdateDB}
      actionAndTriggerPopUp={() => {}}
      backgroundShade={backgroundShade}
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
