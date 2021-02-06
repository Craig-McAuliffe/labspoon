import React, {useState, useEffect, useContext} from 'react';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {
  addSelectedUsers,
  SelectUsers,
} from '../../../components/Group/CreateGroupPage/GroupInfoForm';
import CreateResourceFormActions from '../../../components/Forms/CreateResourceFormActions';
import {db} from '../../../firebase';
import {AuthContext} from '../../../App';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {useHistory} from 'react-router-dom';

import './EditGroupMembers.css';

export default function EditGroupMembers({groupData, children}) {
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [membersAreModified, setMembersAreModified] = useState(false);
  const history = useHistory();
  const groupID = groupData.id;
  const {userProfile} = useContext(AuthContext);
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
  // check if members have been changed
  useEffect(() => {
    const selectedUsersIDs = selectedUsers.reduce(
      (accumulator, currentValue) => {
        if (!currentValue || !currentValue.id) return '';
        return accumulator + currentValue.id;
      },
      ['']
    );
    const membersUsersIDs = groupMembers.reduce(
      (accumulator, currentValue) => {
        if (!currentValue || !currentValue.id) return '';
        return accumulator + currentValue.id;
      },
      ['']
    );
    if (selectedUsersIDs === membersUsersIDs) setMembersAreModified(false);
    else setMembersAreModified(true);
  }, [selectedUsers]);

  const onCancel = () => {
    setSelectedUsers([groupMembers]);
  };
  const onSubmitMembers = async () => {
    setSubmitting(true);
    const memberIDsToBeRemoved = [];
    const invitationsToBeRemoved = [];
    const groupDocRef = db.doc(`groups/${groupID}`);
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
    const batch = db.batch();
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
          invitingUserID: userProfile.id,
        };
        const groupInvitationRef = groupDocRef.collection('invitations').doc();
        batch.set(groupInvitationRef, invitation);
        batch.set(
          db.doc(`invitations/group/newMemberInvites/${groupInvitationRef.id}`),
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
      batch.set(groupDocRef.collection('members').doc(newMember.id), memberRef);
    });
    memberIDsToBeRemoved.forEach((memberIDToBeRemoved) => {
      batch.delete(groupDocRef.collection('members').doc(memberIDToBeRemoved));
    });
    invitationsToBeRemoved.forEach((invitationToRemove) => {
      batch.delete(
        groupDocRef
          .collection('invitations')
          .doc(invitationToRemove.invitationID)
      );
    });
    await batch.commit();
    setSubmitting(false);
    history.push(`/group/${groupID}`);
  };

  const chooseMembers = (
    <>
      <SelectUsers
        selectedUsers={selectedUsers}
        addSelectedUsers={(chosenUser) =>
          addSelectedUsers(
            chosenUser,
            selectedUsers,
            setSelectedUsers,
            userProfile.id
          )
        }
        setSelectedUsers={setSelectedUsers}
      />
      {membersAreModified ? (
        <CreateResourceFormActions
          submitText="Submit"
          submitting={submitting}
          cancelForm={onCancel}
          customAction={onSubmitMembers}
        />
      ) : null}
    </>
  );

  const loadingScreen = (
    <div className="edit-group-members-spinner-container">
      <LoadingSpinner />
    </div>
  );
  return (
    <PaddedPageContainer>
      {children}
      {submitting ? loadingScreen : chooseMembers}
    </PaddedPageContainer>
  );
}
