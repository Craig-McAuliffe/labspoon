import React, {useState, useContext, useEffect} from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
} from 'react-instantsearch-dom';
import ImageUploader from 'react-images-upload';

import {searchClient} from '../../../algolia';
import {abbrEnv} from '../../../config';

import {AuthContext, FeatureFlags} from '../../../App';
import FormTextInput, {
  FormTextArea,
} from '../../../components/Forms/FormTextInput';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import NegativeButton from '../../../components/Buttons/NegativeButton';
import CreatePost from '../../../components/Posts/Post/CreatePost/CreatePost';
import GroupAvatar from '../../../components/Avatar/GroupAvatar';
import {AddMemberIcon, AddProfilePhoto} from '../../../assets/CreateGroupIcons';
import UserListItem, {
  UserSmallResultItem,
} from '../../../components/User/UserListItem';

import './CreateGroupPage.css';

// To do: check if the group exists OR pass argument that declares if editing or creating
// Change onSubmit function depending on editing or creating

export default function GroupInfoForm({
  initialValues,
  onSubmit,
  setAvatar,
  setSelectedUsers,
  selectedUsers,
  existingAvatar,
  cancelForm,
  submitText,
}) {
  const [submitted, setSubmitted] = useState(false);
  const {user, userProfile} = useContext(AuthContext);
  const featureFlags = useContext(FeatureFlags);
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    location: Yup.string(),
    institution: Yup.string(),
    website: Yup.string(),
    about: Yup.string().max(1000, 'Must have fewer than 1000 characters'),
  });

  function onSubmitAndPreventDuplicate(values) {
    if (submitted) return;
    setSubmitted(true);
    onSubmit(values);
  }

  useEffect(() => {
    if (userProfile === undefined) return;
    setSelectedUsers((previouslySelectedUsers) => [
      ...previouslySelectedUsers,
      ...[userProfile],
    ]);
  }, [userProfile, setSelectedUsers]);

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
          onSubmit={onSubmitAndPreventDuplicate}
        >
          <Form id="create-group-form">
            <div className="create-group-profile-info-container">
              <EditAvatar
                existingAvatar={existingAvatar}
                onAvatarSelect={onAvatarSelect}
              />
              <div className="create-group-meta-info">
                <h3>Basic Info</h3>
                <FormTextInput label="Name" name="name" sideLabel />
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

            <FormTextArea height="200" label="About" name="about" bigLabel />
          </Form>
        </Formik>
        <SelectUsers
          selectedUsers={selectedUsers}
          addSelectedUsers={addSelectedUsers}
          setSelectedUsers={setSelectedUsers}
        />

        {featureFlags.has('create-pinned-post') ? (
          <>
            <h4>{`If there's a post you'd like to appear at the top of your group page, you can add it here:`}</h4>
            <div className="create-group-pinned-post-container">
              <CreatePost pinnedPost />
            </div>
          </>
        ) : null}
        <div className="create-group-submit-cancel-container">
          <div className="create-group-cancel">
            <CancelButton cancelAction={cancelForm} />
          </div>
          <div className="create-group-submit">
            <PrimaryButton
              submit
              formID="create-group-form"
              disabled={submitted}
            >
              {submitText}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditAvatar({existingAvatar, onAvatarSelect}) {
  const [editingAvatar, setEditingAvatar] = useState(false);
  if (!existingAvatar || editingAvatar)
    return (
      <div className="group-profile-avatar">
        <AddProfilePhoto />
        <ImageUploader
          onChange={onAvatarSelect}
          imgExtension={['.jpg', '.png']}
          singleImage
          withPreview
          withIcon={false}
          buttonStyles={{background: '#00507c'}}
        />
        <CancelButton cancelAction={() => setEditingAvatar(false)} />
      </div>
    );
  return (
    <div>
      <h3>Group Picture </h3>
      <button
        className="edit-group-info-upload-photo-button"
        onClick={() => setEditingAvatar(true)}
      >
        <GroupAvatar src={existingAvatar} height="190px" width="190px" />
        <h3>Upload New Photo</h3>
        <div className="edit-group-info-upload-photo-button-plus"></div>
      </button>
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
    setSelectedUsers((previouslySelectedMembers) => {
      const curatedSelectedMembers = [...previouslySelectedMembers];
      curatedSelectedMembers.splice(indexToBeRemoved, 1);
      if (curatedSelectedMembers.length === 0) return [];
      return curatedSelectedMembers;
    });
  };
  return (
    <>
      {selectedUsers.map((user) => (
        <UserListItem user={user} key={user.id}>
          {user.resourceType ? (
            <NegativeButton onClick={() => removeSelectedUser(user.id)}>
              Remove
            </NegativeButton>
          ) : null}
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
