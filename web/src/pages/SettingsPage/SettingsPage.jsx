import React, {useContext, useState} from 'react';

import {AuthContext} from '../../App';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import UserAvatar from '../../components/Avatar/UserAvatar';
import users from '../../mockdata/users';
import SaveButton from '../../components/Buttons/SaveButton';
import CancelButton from '../../components/Buttons/CancelButton';
import FormTextInput from '../../components/Forms/FormTextInput';
import GeneralError from '../../components/GeneralError';

import './SettingsPage.css';

const SettingsPage = () => {
  const user = useContext(AuthContext);
  const mockUser = users().filter((mockUser) => mockUser.id === user.uid)[0];
  const [editState, setEditState] = useState(false);

  const submitChanges = (cancel) => {
    setEditState(false);
    if (cancel !== true) {
    }
  };

  const editDetailsDisplay = () => (
    <>
      {editState === 'email' ? (
        <ChangeEmailForm user={user} submitChanges={submitChanges} />
      ) : editState === 'password' ? (
        <ChangePasswordForm user={user} submitChanges={submitChanges} />
      ) : (
        <>
          <GeneralError />{' '}
          <CancelButton onClick={() => setEditState(false)}>
            Cancel
          </CancelButton>
        </>
      )}
    </>
  );

  return (
    <>
      <div className="sider-layout-no-border"></div>
      <div className="content-layout">
        <div className="settings-page-content">
          <div className="settings-page-header">
            <UserAvatar src={mockUser.avatar} width="100" height="100" />
            <h2>{user.displayName}</h2>
          </div>
          {editState === false ? (
            <div className="setting-page-user-details">
              <button onClick={() => setEditState('email')}>
                Change Email
              </button>
              <span>{user.email}</span>
              <button onClick={() => setEditState('password')}>
                Change Password
              </button>
              <span></span>
            </div>
          ) : (
            editDetailsDisplay()
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;

function ChangeEmailForm({user, submitChanges}) {
  const initialValues = {
    newEmail: '',
  };

  const validationSchema = Yup.string().email().required('Email is required');

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={submitChanges}
    >
      <Form className="signin-form">
        <FormTextInput name="newEmail" label="New Email" />
        <div className="cancel-or-submit">
          <CancelButton onClick={() => submitChanges(true)}>
            Cancel
          </CancelButton>
          <SaveButton currentState={false} submit={submitChanges} />
        </div>
      </Form>
    </Formik>
  );
}
function ChangePasswordForm({user, submitChanges}) {
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Current Password is required')
      .test('correct-password', 'incorrect password', function (value) {
        return user.password === value;
      }),
    newPassword: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long.')
      .matches(/(?=.*[0-9])/, 'Password must contain a number.'),
    confirmNewPassword: Yup.string()
      .required('Password confirmation is required')
      .label('Confirm password')
      .test('passwords-match', 'Passwords must match', function (value) {
        // eslint-disable-next-line no-invalid-this
        return this.parent.newPassword === value;
      }),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={submitChanges}
    >
      <Form className="signin-form">
        <FormTextInput
          name="currentPassword"
          autoComplete="current-password"
          label="Current Password"
        />
        <FormTextInput name="newPassword" label="New Password" />
        <FormTextInput name="confirmNewPassword" label="Confirm New Password" />
        <div className="cancel-or-submit">
          <CancelButton onClick={() => submitChanges(true)}>
            Cancel
          </CancelButton>
          <SaveButton currentState={false} submit={submitChanges} />
        </div>
      </Form>
    </Formik>
  );
}
