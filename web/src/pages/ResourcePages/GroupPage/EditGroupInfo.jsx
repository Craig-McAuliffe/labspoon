import React, {useState, useEffect, useContext} from 'react';
import GroupInfoForm from '../../../components/Group/CreateGroupPage/GroupInfoForm';
import {db} from '../../../firebase';
import {v4 as uuid} from 'uuid';
import {AuthContext} from '../../../App';
import {useHistory} from 'react-router-dom';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {editGroupAvatarStorageInForm} from '../../../helpers/groups';

import './GroupPage.css';

export default function EditingGroupInfo({groupData, children}) {
  const groupID = groupData.id;
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [verified, setVerified] = useState(undefined);
  const [avatar, setAvatar] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const userID = user.uid;

  useEffect(() => {
    if (error) {
      alert(
        'Something went wrong while editing the group. Please try again. If the problem persists, please email help@labspoon.com'
      );
      setSelectedUsers(groupMembers);
      setError(false);
    }
  }, [error, setSelectedUsers, setError, groupMembers]);

  useEffect(() => {
    db.doc(`verifiedGroups/${groupID}`)
      .get()
      .then((ds) => setVerified(ds.exists))
      .catch((err) => alert(err));
  }, [groupID]);

  useEffect(() => {
    async function fetchGroupMembers() {
      const members = [];
      const existingMembersQS = await db
        .collection(`groups/${groupID}/members`)
        .get();
      existingMembersQS.forEach((doc) => {
        const member = doc.data();
        member.resourceType = 'user';
        members.push(member);
      });
      const invitationsQS = await db
        .collection(`groups/${groupID}/invitations`)
        .get();
      invitationsQS.forEach((doc) => {
        const invitation = doc.data();
        const emailInvitation = {
          // cannot be id as this confuses rendering with an existing member
          invitationID: doc.id,
          email: invitation.email,
        };
        members.push(emailInvitation);
      });
      setGroupMembers(members);
    }
    fetchGroupMembers();
  }, [groupID]);

  useEffect(() => {
    setSelectedUsers(groupMembers);
  }, [groupMembers]);

  const initialValues = {
    name: groupData.name ? groupData.name : '',
    location: groupData.location ? groupData.location : '',
    institution: groupData.institution ? groupData.institution : '',
    website: groupData.website ? groupData.website : '',
    about: groupData.about ? groupData.about : '',
    donationLink: groupData.donationLink || '',
  };

  const onSubmitEdit = (values) => {
    setSubmitting(true);
    const memberIDsToBeRemoved = [];
    const invitationsToBeRemoved = [];
    groupMembers.forEach((existingGroupMember) => {
      if (!existingGroupMember.id) {
        if (
          !selectedUsers.some((newGroupMember) => {
            return newGroupMember.email === existingGroupMember.email;
          })
        ) {
          invitationsToBeRemoved.push(existingGroupMember);
          return;
        }
      }
      if (
        !selectedUsers.some(
          (newGroupMember) => newGroupMember.id === existingGroupMember.id
        )
      )
        memberIDsToBeRemoved.push(existingGroupMember.id);
    });

    const writeToDB = (avatarID, downloadURL) => {
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      if (downloadURL) values.avatar = downloadURL;
      if (avatarID) values.avatarCloudID = avatarID;
      batch.update(groupDocRef, values);
      selectedUsers.forEach((newMember) => {
        if (!newMember.id) {
          const invitation = {
            email: newMember.email,
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
          id: newMember.id,
          name: newMember.name,
          avatar: newMember.avatar ? newMember.avatar : '',
        };
        batch.set(
          groupDocRef.collection('members').doc(newMember.id),
          memberRef
        );
      });
      memberIDsToBeRemoved.forEach((memberIDToBeRemoved) => {
        batch.delete(
          groupDocRef.collection('members').doc(memberIDToBeRemoved)
        );
      });
      invitationsToBeRemoved.forEach((invitationToRemove) => {
        batch.delete(
          groupDocRef
            .collection('invitations')
            .doc(invitationToRemove.invitationID)
        );
      });
      batch
        .commit()
        .catch((err) => {
          console.error('edit group batch failed', err);
          setSubmitting(false);
          setError(true);
        })
        .then(() => {
          setSubmitting(false);
          history.push(`/group/${groupID}`);
        });
    };

    if (avatar.length > 0) {
      editGroupAvatarStorageInForm(
        avatar,
        groupID,
        setSubmitting,
        setError,
        writeToDB,
        groupData.avatarCloudID
      );
    } else {
      writeToDB();
    }
  };

  if (submitting) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      {children}
      <GroupInfoForm
        initialValues={initialValues}
        onSubmit={onSubmitEdit}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        setAvatar={setAvatar}
        existingAvatar={groupData.avatar}
        submitText="Save Changes"
        verified={verified}
        editingGroup={true}
        cancelForm={() => history.push(`/group/${groupID}`)}
        groupType={groupData.groupType}
        submitting={submitting}
      />
    </PaddedPageContainer>
  );
}
