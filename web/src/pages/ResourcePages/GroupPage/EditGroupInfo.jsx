import React, {useState, useEffect} from 'react';
import GroupInfoForm from '../../Groups/CreateGroupPage/GroupInfoForm';
import firebase, {db, storage} from '../../../firebase';

import './GroupPage.css';

export default function EditingGroupInfo({groupData, setEditingGroup}) {
  const groupID = groupData.id;
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [avatar, setAvatar] = useState([]);

  useEffect(() => {
    const fetchGroupMembers = db
      .collection(`groups/${groupID}/members`)
      .get()
      .then((qs) => {
        const users = [];
        qs.forEach((doc) => {
          const user = doc.data();
          user.resourceType = 'user';
          users.push(user);
        });
        return users;
      });
    fetchGroupMembers.then((fetchedMembers) => setGroupMembers(fetchedMembers));
  }, [groupID]);

  useEffect(() => {
    setSelectedUsers(groupMembers);
  }, [groupMembers]);

  const initialValues = {
    name: groupData.name,
    location: groupData.location,
    institution: groupData.institution,
    website: groupData.website,
    about: groupData.about,
  };

  const onSubmitEdit = (values) => {
    const memberIDsToBeRemoved = [];
    groupMembers.forEach((existingGroupMember) => {
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
      batch
        .commit()
        .catch((err) => alert(err, 'batch failed to commit'))
        .then(() => setEditingGroup(false));
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
    <GroupInfoForm
      initialValues={initialValues}
      onSubmit={onSubmitEdit}
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      setAvatar={setAvatar}
      existingAvatar={groupData.avatar}
      cancelForm={() => setEditingGroup(false)}
      submitText="Save Changes"
    />
  );
}
