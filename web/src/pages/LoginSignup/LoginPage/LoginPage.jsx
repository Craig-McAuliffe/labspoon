import React, {useContext, useState} from 'react';
import firebase from '../../../firebase.js';
import {Link, Redirect, useLocation} from 'react-router-dom';
import {AuthContext} from '../../../App';
import {Form, Formik} from 'formik';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import FormTextInput from '../../../components/Forms/FormTextInput';
import LoadingSpinner, {
  LoadingSpinnerPage,
} from '../../../components/LoadingSpinner/LoadingSpinner';
import * as Yup from 'yup';
import GoogleButton from 'react-google-button';
import GoogleSignIn from '../GoogleSignIn.jsx';
import {PaddedPageContainer} from '../../../components/Layout/Content.jsx';

import './LoginPage.css';
import TertiaryButton from '../../../components/Buttons/TertiaryButton.jsx';
import CreateResourceFormActions from '../../../components/Forms/CreateResourceFormActions.jsx';
import SuccessMessage from '../../../components/Forms/SuccessMessage.jsx';

/**
 * Log in page using the Firebase authentication handler
 * @return {React.ReactElement}
 */
function LoginPage() {
  const locationState = useLocation().state;
  const returnLocation = locationState
    ? locationState.returnLocation
    : undefined;
  const resetPasswordState = locationState
    ? locationState.resetPassword
    : undefined;
  const claimGroupID = locationState ? locationState.claimGroupID : undefined;
  const {userProfile} = useContext(AuthContext);
  const {updateUserDetails} = useContext(AuthContext);
  const [loading, setLoading] = useState();
  const [googleSignInFlow, setGoogleSignInFlow] = useState(false);
  const [forgottenPassword, setForgottenPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [resetPasswordEmailWasSent, setResetPasswordEmailWasSent] = useState(
    false
  );
  if (loading) return <LoadingSpinnerPage />;
  if (!userProfile || isSigningUp) {
    if (forgottenPassword)
      return (
        <PaddedPageContainer>
          <ForgottenPasswordForm
            setForgottenPassword={setForgottenPassword}
            resetPasswordEmailWasSent={resetPasswordEmailWasSent}
            setResetPasswordEmailWasSent={setResetPasswordEmailWasSent}
          />
        </PaddedPageContainer>
      );
    return (
      <PaddedPageContainer>
        {googleSignInFlow && (
          <GoogleSignIn
            updateUserDetails={updateUserDetails}
            setLoading={setLoading}
            setGoogleSignInFlow={setGoogleSignInFlow}
            setIsSigningUp={setIsSigningUp}
          />
        )}
        <h2 className="signin-form-title">{`Welcome Back`}</h2>
        <p className="sign-in-option">
          {`Don't have an account yet? `}
          <Link to={{pathname: '/signup', state: locationState}}>
            Sign up here
          </Link>
        </p>
        {resetPasswordEmailWasSent && (
          <SuccessMessage>Password reset email sent</SuccessMessage>
        )}
        {resetPasswordState && (
          <SuccessMessage>Password reset was successful</SuccessMessage>
        )}
        <SignInForm
          setForgottenPassword={setForgottenPassword}
          setIsSigningUp={setIsSigningUp}
        />
        <div className="login-submit-button-container">
          <GoogleButton
            onClick={() => {
              setGoogleSignInFlow(true);
            }}
          />
        </div>
        <div className="signup-submit-button-container">
          <span className="sign-up-privacy-policy-disclaimer">
            By signing up, you are agreeing to our{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>
          </span>
        </div>
      </PaddedPageContainer>
    );
  } else {
    if (!userProfile.name || userProfile.name.length === 0)
      return (
        <Redirect
          to={{
            pathname: '/userName',
            state: {returnLocation: returnLocation},
          }}
        />
      );
    if (userProfile.hasCompletedOnboarding && returnLocation)
      return <Redirect to={returnLocation} />;
    if (userProfile.hasCompletedOnboarding) return <Redirect to="/" />;
    return (
      <Redirect
        to={{
          pathname: '/onboarding/follow',
          state: {returnLocation: returnLocation, claimGroupID: claimGroupID},
        }}
      />
    );
  }
}

const SignInForm = ({setForgottenPassword, setIsSigningUp}) => {
  const [loading, setLoading] = useState(false);
  const submitChanges = (values) => {
    setIsSigningUp(true);
    setLoading(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(values.email, values.password)
      .then(() => {
        setLoading(false);
        setIsSigningUp(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.message.includes('password is invalid')) {
          alert(
            'The password you entered is not correct for that email address.'
          );
        } else if (error.message.toLowerCase().includes('too many'))
          alert(
            'You have entered too many incorrect passwords. Please try again later.'
          );
        else if (
          error.message
            .toLowerCase()
            .includes('There is no user record corresponding')
        )
          alert('There is no Labspoon user registered to that email.');
        else {
          alert(
            'Something went wrong. We will look into it. Please try signing in later.'
          );
        }
        setIsSigningUp(false);
      });
  };

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required('Email is required')
      .email('Please enter a valid email address')
      .max(
        1000,
        'Email address is too long. It must have fewer than 1000 characters.'
      ),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long.'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={submitChanges}
    >
      <Form className="signin-form">
        <FormTextInput name="email" autoComplete="email" label="Email" />
        <FormTextInput name="password" label="Password" passwordInput={true}>
          <ForgottenPassWordButton
            setForgottenPassword={setForgottenPassword}
          />
        </FormTextInput>

        <div className="cancel-or-submit">
          <div></div>
          <div className="login-submit-button-container">
            <PrimaryButton submit={true}>Sign in</PrimaryButton>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : null}
      </Form>
    </Formik>
  );
};

function ForgottenPassWordButton({setForgottenPassword}) {
  return (
    <div className="login-page-forgot-page">
      <TertiaryButton onClick={() => setForgottenPassword(true)}>
        Forgotten password
      </TertiaryButton>
    </div>
  );
}
function ForgottenPasswordForm({
  setForgottenPassword,
  resetPasswordEmailWasSent,
  setResetPasswordEmailWasSent,
}) {
  const [savedEmailInput, setSavedEmailInput] = useState({});
  const [submittingReset, setSubmittingReset] = useState(false);
  const submitPasswordReset = (values) => {
    if (resetPasswordEmailWasSent) setResetPasswordEmailWasSent(false);
    setSubmittingReset(true);
    return firebase
      .auth()
      .sendPasswordResetEmail(values.email)
      .then(function () {
        setForgottenPassword(false);
        setResetPasswordEmailWasSent(true);
      })
      .catch(function (error) {
        setSavedEmailInput(values.email);
        console.error(`unable to send password reset email ${error}`);
        console.log('handle error codes');
      });
  };
  return (
    <Formik
      validationSchema={Yup.object({
        email: Yup.string()
          .required('Email is required')
          .email('Please enter a valid email address')
          .max(
            1000,
            'Email address is too long. It must have fewer than 1000 characters.'
          ),
      })}
      initialValues={{
        email: savedEmailInput.email ? savedEmailInput.email : '',
      }}
      onSubmit={submitPasswordReset}
    >
      <Form>
        <p>
          We will send a password reset email to the address you enter here.
        </p>
        <FormTextInput
          name="email"
          autoComplete="email"
          label="Email address of Labspoon account"
        />
        <CreateResourceFormActions
          cancelForm={() => setForgottenPassword(false)}
          submitText="Send Reset Email"
          noBorder={true}
          submitting={submittingReset}
        />
      </Form>
    </Formik>
  );
}

export default LoginPage;
