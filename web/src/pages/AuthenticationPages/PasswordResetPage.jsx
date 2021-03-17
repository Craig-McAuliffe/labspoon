import {Form, Formik} from 'formik';
import React, {useEffect, useState} from 'react';
import ErrorMessage from '../../components/Forms/ErrorMessage';
import FormTextInput from '../../components/Forms/FormTextInput';
import {PaddedPageContainer} from '../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../components/LoadingSpinner/LoadingSpinner';
import firebase from '../../firebase';
import {useHistory} from 'react-router-dom';
import * as Yup from 'yup';
import CreateResourceFormActions from '../../components/Forms/CreateResourceFormActions';

export default function PasswordResetPage() {
  const [resetCode, setResetCode] = useState(false);
  const [codeResetError, setResetCodeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const urlParams = new URLSearchParams(window.location.search);
  const resetCodeFromURL = urlParams.get('oobCode');
  if (!resetCode) setResetCode(resetCodeFromURL);

  useEffect(() => {
    if (resetCode) return;
    firebase
      .auth()
      .verifyPasswordResetCode(resetCode)
      .catch((err) => {
        console.error(`unable to verify password reset code ${err}`);

        handlePasswordResetErrors(err, setResetCodeError);
      });
  }, [resetCode]);

  const initialValues = {
    newPassword: '',
    confirmNewPassword: '',
  };

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long.')
      .max(30, 'Password is too long. It must have fewer than 30 characters.'),
    confirmNewPassword: Yup.string()
      .required('Password confirmation is required')
      .label('Confirm password')
      .test('passwords-match', 'Passwords must match', function (value) {
        // eslint-disable-next-line no-invalid-this
        return this.parent.newPassword === value;
      }),
  });

  const submitChanges = (values) => {
    setSubmitting(true);
    if (codeResetError) setResetCodeError(false);

    return firebase
      .auth()
      .confirmPasswordReset(resetCode, values.newPassword)
      .then(() => {
        history.push('/login', {
          resetPassword: true,
        });
      })
      .catch((err) => {
        console.error(`unable to reset password ${err}`);
        handlePasswordResetErrors(err, setResetCodeError);
      });
  };

  if (!resetCode || submitting) return <LoadingSpinnerPage />;
  const errorMessageDisplay = (
    <ErrorMessage noBorder={true}>{codeResetError}</ErrorMessage>
  );
  if (codeResetError && codeResetError !== 'auth/weak-password')
    return <PaddedPageContainer>{errorMessageDisplay}</PaddedPageContainer>;

  return (
    <PaddedPageContainer>
      <h2>Reset your password</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitChanges}
      >
        <Form>
          {codeResetError && {errorMessageDisplay}}
          <FormTextInput
            label="New password"
            name="newPassword"
            passwordInput={true}
          />
          <FormTextInput
            label="Confirm new password"
            name="confirmNewPassword"
            passwordInput={true}
          />
          <CreateResourceFormActions
            submitting={submitting}
            submitText="Submit"
            noBorder={true}
          />
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}

const handlePasswordResetErrors = (err, setResetCodeError) => {
  const requestNew = 'Please request another reset email from the login page.';
  switch (err.code) {
    case 'auth/expired-action-code':
      return setResetCodeError('This reset code has expired. ' + requestNew);
    case 'auth/invalid-action-code':
      return setResetCodeError('This reset code is invalid.  ' + requestNew);
    case 'auth/user-disabled':
      return setResetCodeError(
        'The user linked to this reset password request has been disabled. Please contact support if you believe this to be an error.'
      );
    case 'auth/user-not-found':
      return setResetCodeError(
        'The user linked to this reset password request could not be found. Please request a new password reset from the login page or contact support.'
      );
    case 'auth/weak-password':
      return setResetCodeError(
        'The password is too weak. Please ensure it is longer than 8 characters and includes a letter and number.'
      );
    default:
      return setResetCodeError(
        'Something is wrong with the reset password code. ' + requestNew
      );
  }
};
