import React, {useState, useContext} from 'react';
import GroupInfoForm from './GroupInfoForm';
import {useHistory} from 'react-router-dom';
import {v4 as uuid} from 'uuid';

import firebase, {db, storage} from '../../../firebase';
import {projectURL} from '../../../config';

import {AuthContext} from '../../../App';

import './CreateGroupPage.css';

import './CreateGroupPage.css';

export default function CreateGroupPage({
  onboardingCancelOrSubmitAction,
  onboardingConfirmGroupCreation,
}) {
  const history = useHistory();
  const {user, userProfile} = useContext(AuthContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [avatar, setAvatar] = useState([]);

  const initialValues = {
    name: '',
    location: '',
    institution: '',
    website: '',
    about: '',
  };

  function onSubmit(values) {
    const groupID = uuid();
    const avatarStorageRef = storage.ref(`groups/${groupID}/avatar_fullSize`);
    const collectedPostsByMembers = [];

    const readGroupFromDB = () => {
      for (let i = 0; i < selectedUsers.length; i++) {
        db.collection(`users/${selectedUsers[i].id}/posts`)
          .get()
          .then((fetchedPostsByMember) => {
            fetchedPostsByMember.forEach((fetchedPostSnapShot) => {
              const fetchedPostData = fetchedPostSnapShot.data();
              fetchedPostData.onGroupPage = false;
              collectedPostsByMembers.push(fetchedPostData);
            });
            if (i === selectedUsers.length - 1) writeGroupToDB();
          })
          .catch((err) => {
            console.log(err, 'could not fetch posts by members');
            alert('Something went worng, please try agian later. (sorry)');
          });
      }
    };

    const writeGroupToDB = () => {
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      const groupRef = {
        name: values.name,
        about: values.about,
        location: values.location,
        institution: values.institution,
        website: values.website,
        avatar: `https://storage.googleapis.com/${projectURL}/groups/${groupID}/avatar`,
      };
      values.avatar = `https://storage.googleapis.com/${projectURL}/groups/${groupID}/avatar`;

      batch.set(groupDocRef, values);
      batch.set(groupDocRef.collection('members').doc(user.uid), {
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
      });
      batch.set(db.doc(`users/${user.uid}/groups/${groupID}`), groupRef);

      selectedUsers.forEach((member) => {
        batch.set(groupDocRef.collection('members').doc(member.id), {
          id: member.id,
          name: member.name,
          avatar: member.avatar,
        });

        batch.set(db.doc(`users/${member.id}/groups/${groupID}`), groupRef);
      });

      collectedPostsByMembers.forEach((collectedPost) => {
        batch.set(
          groupDocRef.collection('posts').doc(collectedPost.id),

          collectedPost
        );
      });
      batch
        .commit()
        .catch((err) => alert('batch failed to commit'))
        .then(() => {
          if (onboardingCancelOrSubmitAction) {
            onboardingCancelOrSubmitAction();
            onboardingConfirmGroupCreation();
          } else {
            history.push(`/group/${groupID}`);
          }
        });
    };

    if (avatar.length > 0) {
      return avatarStorageRef.put(avatar[0], {contentType: avatar[0].type}).on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // TODO: implement loading symbol
          console.log('snapshot', snapshot);
        },
        (err) => {
          alert(`failed to write avatar ${err}`);
        },
        readGroupFromDB
      );
    }
    return readGroupFromDB();
  }

  return (
    <GroupInfoForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      setAvatar={setAvatar}
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      cancelForm={
        onboardingCancelOrSubmitAction
          ? onboardingCancelOrSubmitAction
          : () => history.push('/')
      }
      submitText="Create Group"
    />
  );
}
