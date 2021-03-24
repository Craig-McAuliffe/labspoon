import React, {useState, useContext, useEffect} from 'react';
import GroupInfoForm from './GroupInfoForm';
import {useHistory} from 'react-router-dom';
import {db} from '../../../firebase';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../LoadingSpinner/LoadingSpinner';
import {editGroupAvatarStorageInForm} from '../../../helpers/groups';
import {PaddedPageContainer} from '../../Layout/Content';
import {initialValueNoTitle} from '../../Forms/Articles/HeaderAndBodyArticleInput';

import './CreateGroupPage.css';

const MAXGROUPS = 12;
export default function CreateGroupPage({
  onboardingCancelOrSubmitAction,
  setCreatedGroupID,
}) {
  const history = useHistory();
  const {user, userProfile} = useContext(AuthContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [numberOfExistingGroups, setNumberOfExistingGroups] = useState();
  const [loading, setLoading] = useState(true);
  const userID = user.uid;

  useEffect(() => {
    if (error) {
      alert(
        'Something went wrong while creating the group. Please try again. If the problem persists, please contact us through the contact page.'
      );
      setSelectedUsers([userProfile]);
      setError(false);
    }
  }, [error, setError, setSelectedUsers, userProfile]);

  useEffect(async () => {
    if (numberOfExistingGroups || !userID) return;
    await db
      .collection(`users/${userID}/groups`)
      .get()
      .then((qs) => {
        if (qs.empty) {
          setNumberOfExistingGroups(0);
          return;
        }
        setNumberOfExistingGroups(qs.size);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userID]);

  const initialValues = {
    name: '',
    location: '',
    institution: '',
    website: '',
    about: initialValueNoTitle,
  };

  async function onSubmit(values) {
    setSubmitting(true);
    const groupDocRef = db.collection('groups').doc();
    const groupID = groupDocRef.id;

    const writeToDB = async () => {
      delete values.avatar;
      const batch = db.batch();
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
            resourceType: 'group',
            resourceID: groupID,
            invitingUserID: userID,
          };
          const groupInvitationRef = groupDocRef
            .collection('invitations')
            .doc();
          batch.set(groupInvitationRef, invitation);
          batch.set(
            db.doc(
              `invitations/group/newMemberInvites/${groupInvitationRef.id}`
            ),
            invitation
          );
          return;
        }
        const memberRef = {
          id: member.id,
          name: member.name,
        };
        if (member.avatar) memberRef.avatar = member.avatar;
        batch.set(groupDocRef.collection('members').doc(member.id), memberRef);
      });
      await batch
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
            if (setCreatedGroupID) setCreatedGroupID(groupID);
          } else {
            history.push(`/group/${groupID}`);
          }
        });
    };

    if (values.avatar && values.avatar.length > 0) {
      return editGroupAvatarStorageInForm(
        values.avatar,
        groupID,
        setSubmitting,
        setError,
        writeToDB
      );
    } else {
      return writeToDB();
    }
  }
  if (submitting || loading) return <LoadingSpinnerPage />;
  if (numberOfExistingGroups && numberOfExistingGroups >= MAXGROUPS)
    return (
      <PaddedPageContainer>
        <h2>You can be a member of {MAXGROUPS} groups maximum.</h2>
        <p>
          If you would like to create a new group, please leave one of which you
          are currently a member.
        </p>
      </PaddedPageContainer>
    );
  return (
    <GroupInfoForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      cancelForm={onboardingCancelOrSubmitAction}
      submitText="Create Group"
    />
  );
}
