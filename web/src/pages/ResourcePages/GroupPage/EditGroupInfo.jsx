import React, {useState, useEffect, useContext} from 'react';
import GroupInfoForm from '../../../components/Group/CreateGroupPage/GroupInfoForm';
import {db} from '../../../firebase';
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const userID = user.uid;

  useEffect(() => {
    if (error) {
      alert(
        'Something went wrong while editing the group. Please try again. If the problem persists, please let us know on the contact page.'
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
  };
  if (groupData.donationLink)
    initialValues.donationLink = groupData.donationLink;
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

    const writeToDB = async (avatarID, downloadURL) => {
      delete values.avatar;
      if (downloadURL) values.avatar = downloadURL;
      if (avatarID) values.avatarCloudID = avatarID;
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      batch.update(groupDocRef, values);
      selectedUsers.forEach((newMember) => {
        if (!newMember.id) {
          if (
            groupMembers.some(
              (groupMember) => groupMember.email === newMember.email
            )
          )
            return;
          const invitation = {
            email: newMember.email,
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
        if (groupMembers.some((groupMember) => groupMember.id === newMember.id))
          return;
        const memberRef = {
          id: newMember.id,
          name: newMember.name,
        };
        if (newMember.avatar) memberRef.avatar = newMember.avatar;
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
      await batch
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

    if (values.avatar && values.avatar.length > 0) {
      return editGroupAvatarStorageInForm(
        values.avatar,
        groupID,
        setSubmitting,
        setError,
        writeToDB
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
