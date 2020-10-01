import React, {useState, useContext} from 'react';
import GroupInfoForm from './GroupInfoForm';
import {useHistory} from 'react-router-dom';
import {v4 as uuid} from 'uuid';

import firebase, {db, storage, projectURL} from '../../../firebase';

import {AuthContext} from '../../../App';

import './CreateGroupPage.css';

import './CreateGroupPage.css';

export default function CreateGroupPage({
  onboardingCancelOrSubmitAction,
  confirmGroupCreation,
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
    const writeToDB = () => {
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
      batch
        .commit()
        .catch((err) => alert('batch failed to commit'))
        .then(() => {
          if (onboardingCancelOrSubmitAction) {
            onboardingCancelOrSubmitAction();
            confirmGroupCreation();
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
        writeToDB
      );
    }
    return writeToDB();
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
