import React, {useState, useEffect, useContext} from 'react';
import GroupInfoForm from '../../../components/Group/CreateGroupPage/GroupInfoForm';
import firebase, {db, storage} from '../../../firebase';
import {Alert} from 'react-bootstrap';
import {v4 as uuid} from 'uuid';
import {AuthContext} from '../../../App';
import {useHistory} from 'react-router-dom';

import './GroupPage.css';

export default function EditingGroupInfo({groupData}) {
  const groupID = groupData.id;
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [verified, setVerified] = useState(undefined);
  const [avatar, setAvatar] = useState([]);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const userID = user.uid;

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
    const writeToDB = () => {
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
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
        .catch((err) => alert(err, 'batch failed to commit'))
        .then(() => {
          history.push(`/group/${groupID}`);
        });
    };
    const avatarStorageRef = storage.ref(`groups/${groupID}/avatar_fullSize`);
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
    writeToDB();
  };

  return (
    <div>
      <Alert variant="warning">
        Profile pictures will be cropped to a 200x200 pixel square, we recommend
        using a square source image to avoid loss of proportion. Profile
        pictures may not update immediately subject to your browser cache, we
        are looking into a fix for this. In the meantime to speed up the reload,
        you can clear your browser cache or view your profile in an incognito
        window.
      </Alert>
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
      />
    </div>
  );
}
