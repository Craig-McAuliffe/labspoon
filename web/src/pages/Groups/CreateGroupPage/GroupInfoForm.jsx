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

import {AuthContext, FeatureFlags} from '../../../App';
import FormTextInput, {
  FormTextArea,
} from '../../../components/Forms/FormTextInput';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import NegativeButton from '../../../components/Buttons/NegativeButton';
import CreatePost from '../../../components/Posts/Post/CreatePost/CreatePost';
import UserAvatar from '../../../components/Avatar/UserAvatar';
import {AddMemberIcon, AddProfilePhoto} from '../../../assets/CreateGroupIcons';
import UserListItem, {
  UserSmallResultItem,
} from '../../../components/User/UserListItem';

import './CreateGroupPage.css';

const abbrEnv = 'dev';

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
  const {user, userProfile} = useContext(AuthContext);
  const featureFlags = useContext(FeatureFlags);
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    location: Yup.string(),
    institution: Yup.string(),
    website: Yup.string(),
    about: Yup.string().max(1000, 'Must have fewer than 1000 characters'),
  });

  useEffect(() => {
    if (userProfile === undefined) return;

    setSelectedUsers((previouslySelectedUsers) => [
      ...previouslySelectedUsers,
      ...[userProfile],
    ]);
  }, [userProfile]);

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
          <Form id="create-group-form">
            <div className="create-group-profile-info-container">
              <div>
                <h3>Group Picture</h3>
                {existingAvatar ? (
                  <UserAvatar
                    src={existingAvatar}
                    height="190px"
                    width="190px"
                  />
                ) : (
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
                  </div>
                )}
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
            <PrimaryButton submit formID="create-group-form">
              {submitText}
            </PrimaryButton>
          </div>
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
