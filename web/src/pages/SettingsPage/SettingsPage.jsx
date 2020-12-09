import React, {useContext, useState, useEffect} from 'react';
import firebase, {db} from '../../firebase';
import {AuthContext} from '../../App';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import UserAvatar from '../../components/Avatar/UserAvatar';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import CancelButton from '../../components/Buttons/CancelButton';
import FormTextInput from '../../components/Forms/FormTextInput';

import './SettingsPage.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const EMAIL = 'email';
const PASSWORD = 'password';
const UPDATE_EMAILS = 'updateEmails';
const DEACTIVATE_ACCOUNT = 'deactivateAccount';

const SettingsPage = () => {
  const {user, userProfile} = useContext(AuthContext);
  const [editState, setEditState] = useState(false);

  if (!userProfile) return <LoadingSpinner />;

  const cancelChanges = () => {
    setEditState(undefined);
  };

  const reauthenticate = (currentPassword) => {
    const userCred = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    return user.reauthenticateWithCredential(userCred);
  };

  let settings;
  switch (editState) {
    case EMAIL:
      settings = (
        <ChangeEmailForm
          user={user}
          cancelChanges={cancelChanges}
          reauthenticate={reauthenticate}
          setEditState={setEditState}
        />
      );
      break;
    case PASSWORD:
      settings = (
        <ChangePasswordForm
          user={user}
          cancelChanges={cancelChanges}
          reauthenticate={reauthenticate}
          setEditState={setEditState}
        />
      );
      break;
    case UPDATE_EMAILS:
      settings = (
        <ChangeUpdateEmailSettingsForm
          cancelChanges={cancelChanges}
          setEditState={setEditState}
        />
      );
      break;
    case DEACTIVATE_ACCOUNT:
      settings = <DeactivateAccountMessage cancelChanges={cancelChanges} />;
      break;
    default:
      settings = (
        <div className="setting-page-user-details">
          <button onClick={() => setEditState(EMAIL)}>Change Email</button>
          <span>{user.email}</span>
          <button onClick={() => setEditState(PASSWORD)}>
            Change Password
          </button>
          <span></span>
          <button onClick={() => setEditState(UPDATE_EMAILS)}>
            Update Email Settings
          </button>
          <span></span>
          <button onClick={() => setEditState(DEACTIVATE_ACCOUNT)}>
            Deactivate or Delete Account
          </button>
          <span></span>
        </div>
      );
  }

  return (
    <>
      <div className="sider-layout-no-border"></div>
      <div className="content-layout">
        <div className="settings-page-content">
          <div className="settings-page-header">
            <UserAvatar src={userProfile.avatar} width="100" height="100" />
            <h2>{user.displayName}</h2>
          </div>
          {settings}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;

function ChangeUpdateEmailSettingsForm({cancelChanges, setEditState}) {
  const {user, userProfile, updateUserDetails} = useContext(AuthContext);
  const [wednesday, setWednesday] = useState(false);
  const [sunday, setSunday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile.updateEmailSettings) {
      setWednesday(userProfile.updateEmailSettings.wednesday);
      setSunday(userProfile.updateEmailSettings.sunday);
    }
    setLoading(false);
  }, [userProfile, setSunday, setWednesday]);

  function handleSubmit() {
    setLoading(true);
    db.doc(`users/${userProfile.id}`)
      .update({
        updateEmailSettings: {
          wednesday: wednesday,
          sunday: sunday,
        },
      })
      .then(() => {
        updateUserDetails(user);
        setEditState(undefined);
      })
      .catch((err) => alert(err));
  }

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit}>
      <br />
      <label>
        <input
          type="checkbox"
          checked={wednesday}
          onChange={() => setWednesday((previous) => !previous)}
        />
        Wednesday
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={sunday}
          onChange={() => setSunday((previous) => !previous)}
        />
        Sunday
      </label>
      <div className="cancel-or-submit">
        <CancelButton cancelAction={cancelChanges} />
        <div className="submit-button-container">
          <PrimaryButton submit={true}>Save</PrimaryButton>
        </div>
      </div>
    </form>
  );
}

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

function DeactivateAccountMessage({cancelChanges}) {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile.id;
  const name = userProfile.name;
  return (
    <>
      <br />
      <p>
        To deactivate or delete your account, please email us at{' '}
        <a href="mailto:help@labspoon.com">help@labspoon.com</a> quoting the
        following:
      </p>
      <p>
        <q>
          {name} {userID}
        </q>
      </p>
      <p>
        Please use the email you use to sign into your Labspoon account so we
        can verify it is really you.
      </p>

      <p>
        {' '}
        We are constantly looking to improve Labspoon for our users, so if there
        is anything you want to tell us about your experience, just add that to
        the email and one of us will get back to you as soon as possible.
      </p>
      <CancelButton cancelAction={cancelChanges} />
    </>
  );
}
