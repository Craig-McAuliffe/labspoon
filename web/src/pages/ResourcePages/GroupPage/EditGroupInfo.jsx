import React, {useState, useEffect} from 'react';
import GroupInfoForm from '../../Groups/CreateGroupPage/GroupInfoForm';
import {db} from '../../../firebase';

import './GroupPage.css';

export default function EditingGroupInfo({groupData, setEditingGroup}) {
  const groupID = groupData.id;
  const [groupMembers, setGroupMembers] = useState([]);
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

  const initialValues = {
    name: groupData.name,
    location: groupData.location,
    institution: groupData.institution,
    website: groupData.website,
    about: groupData.about,
  };

  const onEditSubmit = (values) => {
    const writeToDB = () => {
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      batch.update(groupDocRef, values);
      batch
        .commit()
        .catch((err) => alert('batch failed to commit'))
        .then(() => setEditingGroup(false));
    };

    writeToDB();
  };

  return (
    <GroupInfoForm
      initialValues={initialValues}
      onSubmit={onEditSubmit}
      selectedUsers={groupMembers}
      setSelectedUsers={() => {}}
      existingAvatar={groupData.avatar}
      cancelForm={() => setEditingGroup(false)}
      submitText="Save Changes"
    />
  );
}
