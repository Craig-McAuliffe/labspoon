import React, {useState, useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {v4 as uuid} from 'uuid';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
} from 'react-instantsearch-dom';
import ImageUploader from 'react-images-upload';

import firebase, {db, storage, projectURL} from '../../../firebase';
import {searchClient} from '../../../algolia';

import {FeatureFlags, AuthContext} from '../../../App';
import FormTextInput from '../../../components/Forms/FormTextInput';
import SubmitButton from '../../../components/Buttons/SubmitButton';
import UserListItem, {
  UserSmallResultItem,
} from '../../../components/User/UserListItem';

import './CreateGroupPage.css';

const abbrEnv = 'dev';

export default function CreateGroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const history = useHistory();
  const {user, userProfile} = useContext(AuthContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [avatar, setAvatar] = useState([]);

  if (!featureFlags.has('create-group')) {
    return <></>;
  }

  const initialValues = {
    name: '',
    location: '',
    institution: '',
    website: '',
    about: '',
  };
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    location: Yup.string(),
    institution: Yup.string(),
    website: Yup.string(),
    about: Yup.string(),
  });
  function onSubmit(values) {
    const groupID = uuid();

    const avatarStorageRef = storage.ref(`groups/${groupID}/avatar_fullSize`);
    const writeToDB = () => {
      console.log('writing to db');
      const batch = db.batch();
      const groupDocRef = db.doc(`groups/${groupID}`);
      const groupRef = {
        name: values.name,
        about: values.about,
        avatar: `https://storage.googleapis.com/${projectURL}/groups/${groupID}/avatar`,
      };
      values.avatar = `https://storage.googleapis.com/${projectURL}/groups/${groupID}/avatar`;
      batch.set(groupDocRef, values);
      console.log(userProfile);
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
        .then(() => history.push(`/group/${groupID}`));
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

  // TODO: Prevent duplicate entries and the current user being added.
  const selectUser = (user) => setSelectedUsers([...selectedUsers, user]);

  const onAvatarSelect = (selectedAvatar) => {
    setAvatar(selectedAvatar);
  };

  return (
    <>
      <h1>Create Group</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <FormTextInput label="Name" name="name" sideLabel />
          <FormTextInput label="Location" name="location" sideLabel />
          <FormTextInput label="Institution" name="institution" sideLabel />
          <FormTextInput label="Website" name="website" sideLabel />
          {/* TODO: Align FormTextArea with the design and replace this.*/}
          <FormTextInput label="About" name="about" sideLabel />
          <div className="page-form-footer">
            <SubmitButton inputText="Submit" />
          </div>
        </Form>
      </Formik>
      <ImageUploader
        onChange={onAvatarSelect}
        imgExtension={['.jpg', '.png']}
        singleImage
        withPreview
        withIcon={false}
      />
      <SelectUsers selectedUsers={selectedUsers} selectUser={selectUser} />
    </>
  );
}

function SelectUsers({selectedUsers, selectUser}) {
  const [selectingUser, setSelectingUser] = useState(false);
  return (
    <div>
      <h2>Members</h2>
      <SelectedMembers selectedUsers={selectedUsers} />
      {selectingUser ? (
        <AddMemberSearch
          selectUser={selectUser}
          setSelecting={setSelectingUser}
        />
      ) : (
        <AddMemberButton setSelecting={setSelectingUser} />
      )}
    </div>
  );
}

function SelectedMembers({selectedUsers}) {
  // TODO: Replace the following button with a remove button
  return (
    <>
      {selectedUsers.map((user) => (
        <UserListItem user={user} key={user.id} />
      ))}
    </>
  );
}

function AddMemberButton({setSelecting}) {
  return (
    <button onClick={() => setSelecting(true)} type="button">
      <h3>Add Member</h3>
    </button>
  );
}

function AddMemberSearch({selectUser, setSelecting}) {
  const selectUserAndStopSelecting = (user) => {
    selectUser(user);
    setSelecting(false);
  };
  // TODO: when a user has been selected their entry in the search results should be greyed out
  return (
    <>
      <button onClick={() => setSelecting(false)} type="button">
        <h3>Cancel</h3>
      </button>
      <InstantSearch searchClient={searchClient} indexName={abbrEnv + '_USERS'}>
        <SearchBox />
        <Hits
          hitComponent={({hit}) => {
            return (
              <UserSmallResultItem
                user={hit}
                selectUser={selectUserAndStopSelecting}
                key={hit.id + 'user'}
              />
            );
          }}
        />
        <Configure hitsPerPage={10} />
      </InstantSearch>
    </>
  );
}
