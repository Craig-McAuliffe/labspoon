import React, {useContext, useState} from 'react';
import firebase, {db} from '../../firebase.js';
import {Redirect, useHistory, useLocation} from 'react-router';
import {AuthContext} from '../../App';
import {Form, Formik} from 'formik';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FormTextInput from '../../components/Forms/FormTextInput';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import * as Yup from 'yup';

import './SignupPage.css';
import {getAvatar, getCoverPhoto} from '../../helpers/users.js';

/**
 * Sign up page using the Firebase authentication handler
 * @return {React.ReactElement}
 */
function SignupPage() {
  const location = useLocation().state;
  const returnLocation = location ? location.returnLocation : undefined;
  // This prevents the redirect to '/' being triggered.
  const [goToOnboarding, setGoToOnboarding] = useState(false);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  if (!user) {
    return (
      <div className="content-layout">
        <div className="page-content-container">
          <div>
            <h2 className="signup-form-title">{`Sign up to Labspoon`}</h2>
            <p className="login-option">
              Already have an account?{' '}
              <button onClick={() => history.push('/login')}>
                Sign in here
              </button>
            </p>
            <div className="sign-up-form">
              <SignUpForm setGoToOnboarding={setGoToOnboarding} />
            </div>
          </div>
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
      <Form className="signup-form-title">
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

export default SignupPage;
