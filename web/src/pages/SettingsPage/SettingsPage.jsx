import React, {useContext, useState} from 'react';
import firebase from 'firebase';
import {AuthContext} from '../../App';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import UserAvatar from '../../components/Avatar/UserAvatar';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import CancelButton from '../../components/Buttons/CancelButton';
import FormTextInput from '../../components/Forms/FormTextInput';
import GeneralError from '../../components/GeneralError';

import './SettingsPage.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const SettingsPage = () => {
  const {user, userProfile} = useContext(AuthContext);
  const [editState, setEditState] = useState(false);

  if (!userProfile) return <LoadingSpinner />;

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

  const editDetailsDisplay = () => (
    <>
      {editState === 'email' ? (
        <ChangeEmailForm
          user={user}
          cancelChanges={cancelChanges}
          reauthenticate={reauthenticate}
          setEditState={setEditState}
        />
      ) : editState === 'password' ? (
        <ChangePasswordForm
          user={user}
          cancelChanges={cancelChanges}
          reauthenticate={reauthenticate}
          setEditState={setEditState}
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
            <UserAvatar src={userProfile.avatar} width="100" height="100" />
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

function ChangeEmailForm({user, cancelChanges, reauthenticate, setEditState}) {
  const initialValues = {
    newEmail: '',
  };
  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Current Password is required')
      .min(8, 'Password must be at least 8 characters long.'),
    newEmail: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required')
      .test('same-email', 'This is your current email address ', function (
        value
      ) {
        return user.email !== value;
      }),
  });
  const submitChanges = (values) => {
    reauthenticate(values.currentPassword)
      .then(() => {
        user
          .verifyBeforeUpdateEmail(values.newEmail)
          .then(function () {
            alert(
              `Verification email sent to ${values.newEmail}. You need to click on the link in that email before your account changes will be saved.`
            );
            setEditState(false);
          })
          .catch(function (error) {
            alert(
              `We could not updated your email at this time, please try again later.`
            );
            setEditState(false);
          });
      })
      .catch((error) => {
        console.log(error);
        if (error.message.toLowerCase().includes('too many'))
          alert(
            'You have entered too many incorrect passwords. Please try again later.'
          );
        else alert('The current password that you entered is incorrect');
      });
  };
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
          <div className="submit-button-container">
            <PrimaryButton submit={true}>Save</PrimaryButton>
          </div>
        </div>
      </Form>
    </Formik>
  );
}

function ChangePasswordForm({
  user,
  cancelChanges,
  reauthenticate,
  setEditState,
}) {
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };
  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Current Password is required')
      .min(8, 'Password must be at least 8 characters long.'),
    newPassword: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long.')
      .matches(
        /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
        'Password must contain a mixture of numbers and letters.'
      ),
    confirmNewPassword: Yup.string()
      .required('Password confirmation is required')
      .label('Confirm password')
      .test('passwords-match', 'Passwords must match', function (value) {
        // eslint-disable-next-line no-invalid-this
        return this.parent.newPassword === value;
      }),
  });
  const submitChanges = (values) => {
    reauthenticate(values.currentPassword)
      .then(() => {
        user
          .updatePassword(values.newPassword)
          .then(function () {
            alert('Password successfully updated.');
            setEditState(false);
          })
          .catch((error) => {
            alert(
              `We couldn't update your passowrd at this time. Please try again later.`
            );
            console.log(error);
            setEditState(false);
          });
      })
      .catch((error) => {
        console.log(error);
        if (error.message.toLowerCase().includes('too many'))
          alert(
            'You have entered too many incorrect passwords. Please try again later.'
          );
        else alert('The current password that you entered is incorrect');
      });
  };
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
          <div className="submit-button-container">
            <PrimaryButton submit={true}>Save</PrimaryButton>
          </div>
        </div>
      </Form>
    </Formik>
  );
}
