import React, {useContext, useState} from 'react';
import firebase, {db} from '../../firebase.js';
import {Redirect, useHistory, useLocation} from 'react-router';
import {AuthContext} from '../../App';
import {Form, Formik} from 'formik';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FormTextInput from '../../components/Forms/FormTextInput';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import * as Yup from 'yup';

import './LoginPage.css';
import {getAvatar, getCoverPhoto} from '../../helpers/users.js';

/**
 * Sign in page using the Firebase authentication handler
 * @param {Function} setUser - function that updates the auth context upon a
 * sign in event
 * @return {React.ReactElement}
 */
function LoginPage() {
  const location = useLocation().state;
  const returnLocation = location ? location.returnLocation : undefined;
  // This prevents the redirect to '/' being triggered.
  const [goToOnboarding, setGoToOnboarding] = useState(false);
  const {user} = useContext(AuthContext);
  const [formType, setFormType] = useState(
    useLocation().pathname == '/login' ? 'sign-in' : 'sign-up'
  );
  if (!user) {
    return (
      <div className="content-layout">
        <div className="page-content-container">
          {formType === 'sign-up' ? (
            <div>
              <h2 className="signin-form-title">{`Sign up to Labspoon`}</h2>
              <p className="login-sign-in-option">
                Already have an account?{' '}
                <button onClick={() => setFormType('sign-in')}>
                  Sign in here
                </button>
              </p>
              <div className="sign-up-form">
                <SignUpForm setGoToOnboarding={setGoToOnboarding} />
              </div>
            </div>
          ) : (
            <>
              <h2 className="signin-form-title">{`Welcome Back`}</h2>
              <p className="login-sign-in-option">
                {`Don't have an account yet?`}
                <button onClick={() => setFormType('sign-up')}>
                  Sign up here
                </button>
              </p>
              <SignInForm
                setFormType={setFormType}
                returnLocation={returnLocation}
              />
            </>
          )}
        </div>
      </div>
    );
  } else {
    return goToOnboarding ? (
      <Redirect
        to={{
          pathname: '/onboarding/follow',
          state: {returnLocation: returnLocation},
        }}
      />
    ) : (
      <Redirect to="/" />
    );
  }
}

const SignUpForm = ({setGoToOnboarding}) => {
  const [loading, setLoading] = useState(false);
  const {updateUserDetails} = useContext(AuthContext);
  const submitChanges = (values) => {
    setLoading(true);
    firebase
      .auth()
      .createUserWithEmailAndPassword(values.email, values.password)
      .then((result) => {
        setLoading(false);
        setGoToOnboarding(true);
        result.user
          .updateProfile({displayName: values.userName})
          .then(() =>
            db.doc(`users/${result.user.uid}`).set({
              id: result.user.uid,
              name: result.user.displayName,
              coverPhoto: getCoverPhoto(result.user.uid),
              avatar: getAvatar(result.user.uid),
            })
          )
          .then(() => updateUserDetails(result.user))
          .catch((error) => {
            setLoading(false);
            console.log(error, 'Could not create display name');
          });
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        if (
          error.message.includes(
            'The email address is already in use by another account.'
          )
        ) {
          alert(`There is already a Labspoon account linked to that address.`);
        } else {
          alert(
            'Something went wrong. We will look into it. Please try signing up later.'
          );
        }
      });
  };

  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    userName: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: Yup.string()
      .required('Password confirmation is required')
      .label('Confirm password')
      .test('passwords-match', 'Passwords must match', function (value) {
        // eslint-disable-next-line no-invalid-this
        return this.parent.password === value;
      }),
    userName: Yup.string().required('Please enter your name'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={submitChanges}
    >
      <Form className="signin-form">
        <FormTextInput name="email" autoComplete="email" label="Email" />
        <p className="password-tip">{`Tip: Don't forget to make your password at least 8 digits long and include a number.`}</p>
        <FormTextInput name="password" label="Password" passwordInput={true} />
        <FormTextInput
          name="confirmPassword"
          label="Confirm Password"
          passwordInput={true}
        />
        <FormTextInput
          name="userName"
          label="Your Full Name (this will be displayed on your profile)"
        />
        <div className="cancel-or-submit">
          <div></div>
          <div className="submit-button-container">
            <PrimaryButton submit={true}>Sign Up</PrimaryButton>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : null}
      </Form>
    </Formik>
  );
};

const SignInForm = ({setFormType, returnLocation}) => {
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
            'The password you entered is not connected to that email address.'
          );
        }
        if (error.message.toLowerCase().includes('too many'))
          alert(
            'You have entered too many incorrect passwords. Please try again later.'
          );
        if (
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
          <div className="submit-button-container">
            <PrimaryButton submit={true}>Sign in</PrimaryButton>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : null}
      </Form>
    </Formik>
  );
};

export default LoginPage;
