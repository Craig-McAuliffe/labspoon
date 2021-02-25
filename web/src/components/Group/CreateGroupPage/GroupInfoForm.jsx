import React, {useState, useContext, useEffect} from 'react';
import {Formik, Form, useField} from 'formik';
import * as Yup from 'yup';
import {AuthContext} from '../../../App';
import FormTextInput, {FormTextArea} from '../../Forms/FormTextInput';
import PrimaryButton from '../../Buttons/PrimaryButton';
import NegativeButton from '../../Buttons/NegativeButton';
import {AddMemberIcon} from '../../../assets/CreateGroupIcons';
import UserListItem, {UserListItemEmailOnly} from '../../User/UserListItem';
import CreateResourceFormActions from '../../Forms/CreateResourceFormActions';
import {PaddedContent} from '../../../components/Layout/Content';
import Select, {LabelledDropdownContainer} from '../../Forms/Select/Select';
import {DropdownOption} from '../../Dropdown';
import InputError from '../../../components/Forms/InputError';
import FormImageUpload from '../../Images/FormImageUpload';
import AddMemberContainer from '../../Forms/AddUserToForm';

import './CreateGroupPage.css';
import './GroupInfoForm.css';

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
  verified,
  editingGroup,
  groupType,
  submitting,
  avatar,
}) {
  const {userProfile} = useContext(AuthContext);

  const validationObj = {
    name: Yup.string()
      .required('Name is required')
      .max(500, 'Must have fewer than 500 characters'),
    location: Yup.string(),
    institution: Yup.string(),
    website: Yup.string().url('Must be a valid url'),
    about: Yup.string().max(
      3000,
      'Too long. Must have fewer than 3000 characters'
    ),
    donationLink: Yup.string().url('Must be a valid url'),
  };
  if (!editingGroup)
    validationObj.groupType = Yup.mixed()
      .oneOf([RESEARCH_GROUP, CHARITY])
      .required('You must select a group type');
  const validationSchema = Yup.object(validationObj);

  useEffect(() => {
    if (userProfile === undefined) return;
    setSelectedUsers((previouslySelectedUsers) => [
      ...previouslySelectedUsers,
      ...[userProfile],
    ]);
  }, [userProfile, setSelectedUsers]);

  return (
    <PaddedContent>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {(props) => (
          <>
            <Form id="create-group-form">
              {editingGroup ? null : (
                <GroupTypeSelect name="groupType" {...props} />
              )}
              <EditAvatar
                existingAvatar={existingAvatar}
                setAvatar={(selectedPhotos) => setAvatar(selectedPhotos)}
                submitting={submitting}
                avatar={avatar}
                name="avatar"
              />
              <EditInfo {...props} verified={verified} groupType={groupType} />
            </Form>
          </>
        )}
      </Formik>
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

      <CreateResourceFormActions
        submitText={submitText}
        submitting={submitting}
        cancelForm={cancelForm}
        formID="create-group-form"
      />
    </PaddedContent>
  );
}

export function addSelectedUsers(
  chosenUser,
  selectedUsers,
  setSelectedUsers,
  userID
) {
  if (selectedUsers.length > 14) {
    alert('You can only add 15 members at a time.');
    return;
  }
  if (
    chosenUser.id &&
    (selectedUsers.some((selectedUser) => selectedUser.id === chosenUser.id) ||
      chosenUser.id === userID)
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
}

export function EditInfo({verified, groupType, ...props}) {
  return (
    <>
      <div className="create-group-meta-info">
        <h3>Basic Info</h3>
        <FormTextInput label="Name" name="name" sideLabel />
        <FormTextInput label="Location" name="location" sideLabel />
        <FormTextInput label="Institution" name="institution" sideLabel />
        <FormTextInput label="Website" name="website" sideLabel />
      </div>
      <FormTextArea height="200px" label="About" name="about" bigLabel />
      {(props.values.groupType === CHARITY || groupType === CHARITY) && (
        <VerificationFormOrDonationLinkField verified={verified} />
      )}
    </>
  );
}
function EditAvatar({existingAvatar, submitting}) {
  return (
    <div className="edit-group-avatar-section">
      <h3>Group Picture </h3>
      <div>
        <FormImageUpload
          existingAvatar={existingAvatar}
          submitting={submitting}
          isAvatar={true}
          name="avatar"
        />
      </div>
    </div>
  );
}

export function SelectUsers({
  selectedUsers,
  addSelectedUsers,
  setSelectedUsers,
}) {
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
  const userListItems = selectedUsers.map((user, i) => {
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
      <UserListItemEmailOnly user={user} key={user.email + i}>
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
    <button
      onClick={() => setSelecting(true)}
      type="button"
      className="add-member-button"
    >
      <AddMemberIcon />
    </button>
  );
}

function GroupTypeSelect({...props}) {
  const [, meta] = useField(props);
  let error;
  if (meta.error) error = <InputError error={meta.error} />;
  return (
    <LabelledDropdownContainer label="Group Type">
      <Select required={true} {...props}>
        <DropdownOption value={RESEARCH_GROUP} text="Research Group" />
        <DropdownOption value={CHARITY} text="Charity" />
      </Select>
      {error}
    </LabelledDropdownContainer>
  );
}

function VerificationFormOrDonationLinkField({verified}) {
  if (!verified) return <VerificationRequest />;

  return <FormTextInput label="Donation Link" name="donationLink" sideLabel />;
}

function VerificationRequest() {
  const [open, setOpen] = useState(false);

  let content = (
    <PrimaryButton onClick={() => setOpen(true)} light smallVersion>
      Request Verification
    </PrimaryButton>
  );
  if (open)
    content = (
      <p>
        Please email{' '}
        <a href="mailto:verify@labspoon.com">verify@labspoon.com</a> with your
        institutional email address.
      </p>
    );

  return (
    <div className="request-verification-container">
      <h3>Donations</h3>
      <h4>
        Your group must be verified before you can display a donate link on your
        page
      </h4>
      <div className="request-verification-button-container">{content}</div>
    </div>
  );
}
