import React, {useState, useContext} from 'react';
import GroupInfoForm from './GroupInfoForm';
import {useHistory} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import firebase, {db, storage} from '../../../firebase';

import {AuthContext} from '../../../App';
import {getAvatar} from '../../../helpers/groups';

import './CreateGroupPage.css';

export default function CreateGroupPage({
  onboardingCancelOrSubmitAction,
  confirmGroupCreation,
}) {
  const history = useHistory();
  const {user, userProfile} = useContext(AuthContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [avatar, setAvatar] = useState([]);
  const userID = user.uid;

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
      values.avatar = getAvatar(groupID);
      batch.set(groupDocRef, values);
      const userRef = {
        id: userProfile.id,
        name: userProfile.name,
      };
      if (userProfile.avatar) userRef.avatar = userProfile.avatar;
      batch.set(groupDocRef.collection('members').doc(userID), userRef);
      selectedUsers.forEach((member) => {
        if (!member.id) {
          const invitation = {
            email: member.email,
            type: 'group',
            resourceID: groupID,
            invitingUserID: userID,
          };
          batch.set(
            groupDocRef.collection('invitations').doc(uuid()),
            invitation
          );
          return;
        }
        const memberRef = {
          id: member.id,
          name: member.name,
          avatar: member.avatar,
        };
        batch.set(groupDocRef.collection('members').doc(member.id), memberRef);
      });
      batch
        .commit()
        .catch((err) => {
          console.log(err);
          alert('batch failed to commit');
        })
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
      cancelForm={onboardingCancelOrSubmitAction}
      submitText="Create Group"
    />
  );
}
