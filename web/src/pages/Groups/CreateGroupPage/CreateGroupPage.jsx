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
import FormTextInput, {
  FormTextArea,
} from '../../../components/Forms/FormTextInput';
import SubmitButton from '../../../components/Buttons/SubmitButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import NegativeButton from '../../../components/Buttons/NegativeButton';
import CreatePost from '../../../components/Posts/Post/CreatePost/CreatePost';
import {AddMemberIcon, AddProfilePhoto} from '../../../assets/CreateGroupIcons';
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
  if (featureFlags.has('create-group')) {
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
    about: Yup.string().max(1000, 'Must have fewer than 1000 characters'),
  });
  function onSubmit(values) {
    const groupID = uuid();

    const avatarStorageRef = storage.ref(`groups/${groupID}/avatar_fullSize`);
    const writeToDB = () => {
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

  const addSelectedUsers = (chosenUser) => {
    if (
      selectedUsers.some((selectedUser) => selectedUser.id === chosenUser.id) ||
      chosenUser.id === user.uid
    )
      return;
    else setSelectedUsers([...selectedUsers, chosenUser]);
  };

  const onAvatarSelect = (selectedAvatar) => {
    setAvatar(selectedAvatar);
  };

  return (
    <div className="content-layout">
      <div className="feed-container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form>
            <div className="create-group-profile-info-container">
              <div>
                <h3>Group Picture</h3>
                <div className="group-profile-picture">
                  <AddProfilePhoto />
                  <ImageUploader
                    onChange={onAvatarSelect}
                    imgExtension={['.jpg', '.png']}
                    singleImage
                    withPreview
                    withIcon={false}
                    buttonStyles={{background: '#00507c'}}
                  />
                </div>
              </div>
              <div className="create-group-meta-info">
                <h3>Basic Info</h3>
                <FormTextInput
                  label="Name"
                  name="name"
                  sideLabel
                  customSpacing="0"
                />
                <FormTextInput label="Location" name="location" sideLabel />
                <FormTextInput
                  label="Institution"
                  name="institution"
                  sideLabel
                />
                <FormTextInput label="Website" name="website" sideLabel />
              </div>
            </div>
            <div className="create-group-group-photos"></div>
            <SelectUsers
              selectedUsers={selectedUsers}
              addSelectedUsers={addSelectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
            <FormTextArea height="200" label="About" name="about" bigLabel />
            <div className="create-group-submit-container">
              <div className="create-group-submit">
                <SubmitButton inputText="Create Group" />
              </div>
            </div>
          </Form>
        </Formik>
        <h4>{`If there's a post you'd like to appear at the top of your group page, you can add it here:`}</h4>
        <div className="create-group-pinned-post-container">
          <CreatePost pinnedPost />
        </div>
      </div>
    </div>
  );
}

function SelectUsers({selectedUsers, addSelectedUsers, setSelectedUsers}) {
  const [selectingUser, setSelectingUser] = useState(false);
  return (
    <div className="create-group-add-members-container">
      <h3>Members</h3>
      <SelectedMembers
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
      {selectingUser ? (
        <AddMemberSearch
          addSelectedUsers={addSelectedUsers}
          setSelecting={setSelectingUser}
        />
      ) : (
        <AddMemberButton setSelecting={setSelectingUser} />
      )}
    </div>
  );
}

function SelectedMembers({selectedUsers, setSelectedUsers}) {
  const removeSelectedUser = (selectedUserID) => {
    const indexToBeRemoved = selectedUsers.findIndex(
      (previouslySelectedUser) => previouslySelectedUser.id === selectedUserID
    );
    setSelectedUsers(() => {
      selectedUsers.splice(indexToBeRemoved, 1);
      return selectedUsers.length === 0 ? [] : selectedUsers;
    });
  };
  return (
    <>
      {selectedUsers.map((user) => (
        <UserListItem user={user} key={user.id}>
          <NegativeButton onClick={() => removeSelectedUser(user.id)}>
            Remove
          </NegativeButton>
        </UserListItem>
      ))}
    </>
  );
}

function AddMemberButton({setSelecting}) {
  return (
    <button onClick={() => setSelecting(true)} type="button">
      <AddMemberIcon />
    </button>
  );
}

function AddMemberSearch({addSelectedUsers, setSelecting}) {
  const selectUserAndStopSelecting = (user) => {
    addSelectedUsers(user);
    setSelecting(false);
  };
  // TODO: when a user has been selected their entry in the search results should be greyed out
  return (
    <>
      <div className="create-group-member-search">
        <InstantSearch
          searchClient={searchClient}
          indexName={abbrEnv + '_USERS'}
        >
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
      </div>
      <CancelButton cancelAction={() => setSelecting(false)} />
    </>
  );
}
