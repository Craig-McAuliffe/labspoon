import React, {useContext, useState} from 'react';
import qs from 'qs';
import firebase from '../../../firebase.js';
import {Redirect, useHistory, useLocation} from 'react-router';
import {AuthContext} from '../../../App';
import {Form, Formik} from 'formik';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import FormTextInput from '../../../components/Forms/FormTextInput';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import * as Yup from 'yup';
import {createUserDocOnSignUp} from '../../../helpers/users.js';
import GoogleButton from 'react-google-button';
import {PaddedPageContainer} from '../../../components/Layout/Content.jsx';
import GoogleSignIn from '../GoogleSignIn.jsx';

import './SignupPage.css';

/**
 * Sign up page using the Firebase authentication handler
 * @return {React.ReactElement}
 */
function SignupPage() {
  const [loading, setLoading] = useState(false);
  const location = useLocation().state;
  const search = useLocation().search;
  const returnLocation = location ? location.returnLocation : undefined;
  const {userProfile} = useContext(AuthContext);
  const history = useHistory();
  const {updateUserDetails} = useContext(AuthContext);
  const searchParams = qs.parse(search.slice(1));
  const referrer = searchParams.referrer;
  const [googleSignInFlow, setGoogleSignInFlow] = useState(false);

  if (loading) return <LoadingSpinnerPage />;
  if (!userProfile) {
    return (
      <PaddedPageContainer>
        {googleSignInFlow && (
          <GoogleSignIn
            updateUserDetails={updateUserDetails}
            setLoading={setLoading}
          />
        )}
        <ReferrerAlert referrer={referrer} />
        <h2 className="signup-form-title">{`Sign up to Labspoon`}</h2>
        <p className="signup-option">
          Already have an account?{' '}
          <button onClick={() => history.push('/login')}>Login here</button>
        </p>
        <div className="sign-up-form">
          <SignUpForm setLoading={setLoading} />
          <div className="signup-submit-button-container">
            <GoogleButton
              onClick={() => {
                setGoogleSignInFlow(true);
              }}
            />
          </div>
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
    if (googleSignInFlow) return <Redirect to="/" />;
    return (
      <Redirect
        to={{
          pathname: '/onboarding/follow',
          state: {returnLocation: returnLocation},
        }}
      />
    );
  }
}

const SignUpForm = ({setLoading}) => {
  const {updateUserDetails} = useContext(AuthContext);

  const submitChanges = (values) => {
    setLoading(true);
    firebase
      .auth()
      .createUserWithEmailAndPassword(values.email, values.password)
      .then((result) => {
        createUserDocOnSignUp(
          result,
          setLoading,
          values.userName,
          updateUserDetails
        );
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
            'Something went wrong. Please try refreshing the page and signing up again.'
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
        <div className="signup-submit-button-container">
          <PrimaryButton submit={true}>Sign Up</PrimaryButton>
        </div>
      </Form>
    </Formik>
  );
};

function ReferrerAlert({referrer}) {
  switch (referrer) {
    case 'groupInvite':
      return (
        <div className="referrer-alert">
          <h3>
            You need to sign up to join the group. Don&rsquo;t worry it
            doesn&rsquo;t take long!
          </h3>
        </div>
      );
    default:
      return <></>;
  }
}

export default SignupPage;
