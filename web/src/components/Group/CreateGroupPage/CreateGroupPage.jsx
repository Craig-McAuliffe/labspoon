import React, {useState, useContext, useEffect} from 'react';
import GroupInfoForm from './GroupInfoForm';
import {useHistory} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import {db} from '../../../firebase';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../LoadingSpinner/LoadingSpinner';

import './CreateGroupPage.css';
import {editGroupAvatarStorageInForm} from '../../../helpers/groups';

export default function CreateGroupPage({
  onboardingCancelOrSubmitAction,
  confirmGroupCreation,
}) {
  const history = useHistory();
  const {user, userProfile} = useContext(AuthContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [avatar, setAvatar] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const userID = user.uid;

  useEffect(() => {
    if (error) {
      alert(
        'Something went wrong while creating the group. Please try again. If the problem persists, please email help@labspoon.com'
      );
      setSelectedUsers([userProfile]);
      setError(false);
    }
  }, [error, setError, setSelectedUsers, userProfile]);

  const initialValues = {
    name: '',
    location: '',
    institution: '',
    website: '',
    about: '',
  };

  async function onSubmit(values) {
    setSubmitting(true);
    const groupID = uuid();

    const writeToDB = (avatarID, downloadURL) => {
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      if (downloadURL) values.avatar = downloadURL;
      if (avatarID) values.avatarCloudID = avatarID;
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
          setSubmitting(false);
          console.log('batch failed to commit during create group', err);
          setError(true);
        })
        .then(() => {
          setSubmitting(false);
          if (onboardingCancelOrSubmitAction) {
            onboardingCancelOrSubmitAction();
            confirmGroupCreation();
          } else {
            history.push(`/group/${groupID}`);
          }
        });
    };

    if (avatar.length > 0) {
      editGroupAvatarStorageInForm(
        avatar,
        groupID,
        setSubmitting,
        setError,
        writeToDB
      );
    } else {
      return writeToDB();
    }
  }
  if (submitting) return <LoadingSpinnerPage />;
  return (
    <GroupInfoForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      setAvatar={setAvatar}
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      cancelForm={onboardingCancelOrSubmitAction}
      submitText="Create Group"
      submitting={submitting}
    />
  );
}
