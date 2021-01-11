import React, {useContext, useState} from 'react';
import firebase from '../../../firebase.js';
import {Redirect, useHistory, useLocation} from 'react-router';
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

/**
 * Log in page using the Firebase authentication handler
 * @return {React.ReactElement}
 */
function LoginPage() {
  const location = useLocation().state;
  const returnLocation = location ? location.returnLocation : undefined;
  const {userProfile} = useContext(AuthContext);
  const history = useHistory();
  const {updateUserDetails} = useContext(AuthContext);
  const [loading, setLoading] = useState();
  const [googleSignInFlow, setGoogleSignInFlow] = useState(false);
  if (loading) return <LoadingSpinnerPage />;
  if (!userProfile) {
    return (
      <PaddedPageContainer>
        {googleSignInFlow && (
          <GoogleSignIn
            updateUserDetails={updateUserDetails}
            setLoading={setLoading}
            setGoogleSignInFlow={setGoogleSignInFlow}
          />
        )}
        <h2 className="signin-form-title">{`Welcome Back`}</h2>
        <p className="sign-in-option">
          {`Don't have an account yet?`}
          <button onClick={() => history.push('/signup')}>Sign up here</button>
        </p>
        <SignInForm returnLocation={returnLocation} />
        <div className="login-submit-button-container">
          <GoogleButton
            onClick={() => {
              setGoogleSignInFlow(true);
            }}
          />
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
    return <Redirect to="/" />;
  }
}

const SignInForm = ({returnLocation}) => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const submitChanges = (values) => {
    setLoading(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(values.email, values.password)
      .then(() => {
        setLoading(false);
        if (returnLocation) history.push(returnLocation);
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
      });
  };

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
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
        <FormTextInput name="password" label="Password" passwordInput={true} />
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

export default LoginPage;
