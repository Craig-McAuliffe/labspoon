import React, {useContext, useState} from 'react';
import firebase from 'firebase';
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

  const cancelChanges = () => {
    setEditState(false);
  };

  const reauthenticate = (currentPassword) => {
    const userCred = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    return user.reauthenticateWithCredential(userCred);
  };

  const submitChanges = (values, ...props) => {
    reauthenticate(values.currentPassword).then(() => {
      if ('newEmail' in values) {
        user.updateEmail(values.newEmail).then(function () {
          alert(
            'Email successfully updated. This change should appear on your account page shortly.'
          );
          user
            .sendEmailVerification()
            .then(function () {
              console.log('veritifcation email sent');
            })
            .catch((error) => {
              console.log(error);
            })
            .catch((error) => {
              console.log(error);
            });
        });
      } else {
        user.updatePassword(values.newPassword).then(function () {
          alert(
            'Password successfully updated. This change should appear on your account page shortly.'
          );
          user
            .sendEmailVerification()
            .then(function () {
              console.log('veritifcation email sent');
            })
            .catch((error) => {
              console.log(error);
            })
            .catch((error) => {
              console.log(error);
            });
        });
      }
    });

    setEditState(false);
  };

  const editDetailsDisplay = () => (
    <>
      {editState === 'email' ? (
        <ChangeEmailForm
          user={user}
          submitChanges={submitChanges}
          cancelChanges={cancelChanges}
        />
      ) : editState === 'password' ? (
        <ChangePasswordForm
          user={user}
          submitChanges={submitChanges}
          cancelChanges={cancelChanges}
        />
      ) : (
        <>
          <GeneralError />
          <CancelButton cancelAction={cancelChanges} />
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

function ChangeEmailForm({user, submitChanges, cancelChanges}) {
  const initialValues = {
    newEmail: '',
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current Password is required'),
    newEmail: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required')
      .test('same-email', 'This is your current email address ', function (
        value
      ) {
        return user.email !== value;
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
          passwordInput={true}
        />
        <FormTextInput name="newEmail" label="New Email" />
        <div className="cancel-or-submit">
          <CancelButton cancelAction={cancelChanges} />
          <SaveButton />
        </div>
      </Form>
    </Formik>
  );
}

function ChangePasswordForm({user, submitChanges, cancelChanges}) {
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current Password is required'),
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
        <p className="password-tip">{`Tip: Don't forget to make your password at least 8 digits long and include a number.`}</p>
        <FormTextInput
          name="currentPassword"
          autoComplete="current-password"
          label="Current Password"
          passwordInput={true}
        />
        <FormTextInput
          name="newPassword"
          label="New Password"
          passwordInput={true}
        />
        <FormTextInput
          name="confirmNewPassword"
          label="Confirm New Password"
          passwordInput={true}
        />
        <div className="cancel-or-submit">
          <CancelButton cancelAction={cancelChanges} />
          <SaveButton />
        </div>
      </Form>
    </Formik>
  );
}
