import React, {useState, useContext, useEffect} from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  connectStateResults,
} from 'react-instantsearch-dom';
import ImageUploader from 'react-images-upload';

import {searchClient} from '../../../algolia';
import {abbrEnv} from '../../../config';

import {AuthContext, FeatureFlags} from '../../../App';
import FormTextInput, {FormTextArea} from '../../Forms/FormTextInput';
import PrimaryButton from '../../Buttons/PrimaryButton';
import CancelButton from '../../Buttons/CancelButton';
import NegativeButton from '../../Buttons/NegativeButton';
import CreatePost from '../../Posts/Post/CreatePost/CreatePost';
import GroupAvatar from '../../Avatar/GroupAvatar';
import {AddMemberIcon, AddProfilePhoto} from '../../../assets/CreateGroupIcons';
import UserListItem, {
  UserListItemEmailOnly,
  UserSmallResultItem,
} from '../../User/UserListItem';
import {useLocation} from 'react-router-dom';
import CreateResourceFormActions from '../../Forms/CreateResourceFormActions';
import TabbedContainer from '../../TabbedContainer/TabbedContainer';
import {EmailIcon} from '../../../assets/PostOptionalTagsIcons';
import {SearchIconGrey} from '../../../assets/HeaderIcons';
import {FeedContent} from '../../../components/Layout/Content';

import './CreateGroupPage.css';
import Select, {LabelledDropdownContainer} from '../../Forms/Select/Select';
import {DropdownOption} from '../../Dropdown';

const CHARITY = 'charity';
const RESEARCH_GROUP = 'researchGroup';

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
    groupType: Yup.mixed().oneOf(
      [RESEARCH_GROUP, CHARITY],
      'You must select a group type'
    ),
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
      chosenUser.id &&
      (selectedUsers.some(
        (selectedUser) => selectedUser.id === chosenUser.id
      ) ||
        chosenUser.id === user.uid)
    ) {
      return;
    } else if (
      chosenUser.email &&
      selectedUsers.some(
        (selectedUser) => selectedUser.email === chosenUser.email
      )
    ) {
      return;
    } else setSelectedUsers([...selectedUsers, chosenUser]);
  };

  const onAvatarSelect = (selectedAvatar) => {
    setAvatar(selectedAvatar);
  };
  return (
    <FeedContent>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitAndPreventDuplicate}
      >
        <Form id="create-group-form">
          <GroupTypeSelect name="groupType" />
          <div className="create-group-profile-info-container">
            <EditAvatar
              existingAvatar={existingAvatar}
              onAvatarSelect={onAvatarSelect}
            />
            <div className="create-group-meta-info">
              <h3>Basic Info</h3>
              <FormTextInput label="Name" name="name" sideLabel />
              <FormTextInput label="Location" name="location" sideLabel />
              <FormTextInput label="Institution" name="institution" sideLabel />
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
      <CreateResourceFormActions
        submitText={submitText}
        submitted={submitted}
        cancelForm={cancelForm}
      />
    </FeedContent>
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
        <AddMemberContainer
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
  const removeSelectedUser = (user) => {
    let indexToBeRemoved;
    if (user.id) {
      indexToBeRemoved = selectedUsers.findIndex(
        (previouslySelectedUser) => previouslySelectedUser.id === user.id
      );
    } else if (user.email) {
      indexToBeRemoved = selectedUsers.findIndex(
        (previouslySelectedUser) => previouslySelectedUser.email === user.email
      );
    }
    setSelectedUsers((previouslySelectedMembers) => {
      const curatedSelectedMembers = [...previouslySelectedMembers];
      curatedSelectedMembers.splice(indexToBeRemoved, 1);
      if (curatedSelectedMembers.length === 0) return [];
      return curatedSelectedMembers;
    });
  };
  const userListItems = selectedUsers.map((user) => {
    if (user.id) {
      return (
        <UserListItem user={user} key={user.id}>
          <NegativeButton onClick={() => removeSelectedUser(user)}>
            Remove
          </NegativeButton>
        </UserListItem>
      );
    }
    return (
      <UserListItemEmailOnly user={user} key={user.email}>
        <NegativeButton onClick={() => removeSelectedUser(user)}>
          Remove
        </NegativeButton>
      </UserListItemEmailOnly>
    );
  });
  return <>{userListItems}</>;
}

function AddMemberButton({setSelecting}) {
  return (
    <button onClick={() => setSelecting(true)} type="button">
      <AddMemberIcon />
    </button>
  );
}

function AddMemberContainer({addSelectedUsers, setSelecting}) {
  const tabDetails = [
    {
      name: 'Search on Labspoon',
      icon: <SearchIconGrey />,
      contents: (
        <AddMemberSearch
          addSelectedUsers={addSelectedUsers}
          setSelecting={setSelecting}
        />
      ),
    },
    {
      name: 'Invite By Email',
      icon: <EmailIcon />,
      contents: (
        <AddMemberByEmail
          addSelectedUsers={addSelectedUsers}
          setSelecting={setSelecting}
        />
      ),
    },
  ];

  return <TabbedContainer tabDetails={tabDetails} />;
}

const NoQueryNoResults = connectStateResults(({searchState, children}) => {
  if (!searchState.query) return <></>;
  return children;
});

function AddMemberByEmail({addSelectedUsers, setSelecting}) {
  const validationSchema = Yup.object({
    email: Yup.string().email().required('Email required'),
  });
  function onSubmit(res) {
    addSelectedUsers({
      email: res.email,
    });
    setSelecting(false);
  }
  const pathname = useLocation().pathname;

  return (
    <>
      <Formik
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        initialValues={{
          email: '',
        }}
      >
        <Form id="email-form">
          <FormTextInput label="Email" name="email" sideLabel />
        </Form>
      </Formik>
      <div className="create-group-submit-cancel-container">
        <div className="create-group-cancel">
          <CancelButton cancelAction={() => setSelecting(false)} />
        </div>
        <div className="create-group-submit">
          <PrimaryButton submit formID="email-form">
            Add
          </PrimaryButton>
        </div>
      </div>
      <p className="create-group-invite-email-info">
        The invite will only be sent once you have{' '}
        {pathname.includes('create')
          ? 'created your group'
          : 'saved your changes'}
      </p>
    </>
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
          <div className="instant-search-searchbox-container">
            <SearchBox />
          </div>
          <NoQueryNoResults>
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
          </NoQueryNoResults>
          <Configure hitsPerPage={10} />
        </InstantSearch>
      </div>
      <CancelButton cancelAction={() => setSelecting(false)} />
    </>
  );
}

function GroupTypeSelect({...props}) {
  return (
    <LabelledDropdownContainer label="Group Type">
      <Select {...props}>
        <DropdownOption value={RESEARCH_GROUP} text="Research Group" />
        <DropdownOption value={CHARITY} text="Charity" />
      </Select>
    </LabelledDropdownContainer>
  );
}
