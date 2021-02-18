import React, {useContext, useState} from 'react';
import qs from 'qs';
import firebase from '../../../firebase.js';
import {Link, Redirect, useHistory, useLocation} from 'react-router-dom';
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
import {reCaptchaSiteKey} from '../../../config';
import useScript from '../../../helpers/useScript';
import useDomRemover from '../../../helpers/useDomRemover.js';
import './SignupPage.css';
import reCaptcha from '../../../helpers/activity.js';

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
  const [savedInitialValues, setSavedInitialValues] = useState();

  useScript(
    `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`
  );

  useDomRemover('.grecaptcha-badge');

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
        <ReferrerAlert referrer={referrer} />
        <h2 className="signup-form-title">{`Sign up to Labspoon`}</h2>
        <p className="signup-option">
          Already have an account?{' '}
          <button onClick={() => history.push('/login')}>Login here</button>
        </p>
        <div className="sign-up-form">
          <SignUpForm
            setLoading={setLoading}
            setSavedInitialValues={setSavedInitialValues}
            savedInitialValues={savedInitialValues}
          />
          <div className="signup-submit-button-container">
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

const SignUpForm = ({
  setLoading,
  setSavedInitialValues,
  savedInitialValues,
}) => {
  const {updateUserDetails} = useContext(AuthContext);

  const submitChanges = async (values) => {
    setLoading(true);

    const defaultAlert = () =>
      alert(
        'Something went wrong. Please try refreshing the page and signing up again.'
      );
    const authenticateThenUpdateDB = () => {
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
          console.log(error);
          setLoading(false);
          if (
            error.message.includes(
              'The email address is already in use by another account.'
            )
          ) {
            alert(
              `There is already a Labspoon account linked to that address.`
            );
          } else {
            defaultAlert();
          }
        });
    };
    const reCaptchaFailFunction = () => {
      setSavedInitialValues(values);
      alert('Our security system thinks you might be a bot. Please try again');
      setLoading(false);
    };
    const reCaptchaErrorFunction = () => {
      setSavedInitialValues(values);
      defaultAlert();
      setLoading(false);
    };
    return reCaptcha(
      0.2,
      authenticateThenUpdateDB,
      reCaptchaFailFunction,
      reCaptchaErrorFunction
    );
  };

  const initialValues = savedInitialValues
    ? savedInitialValues
    : {
        email: '',
        password: '',
        confirmPassword: '',
        userName: '',
      };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required')
      .max(
        200,
        'Email address is too long. It must have fewer than 200 characters.'
      ),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long.')
      .max(30, 'Password is too long. It must have fewer than 30 characters.'),
    confirmPassword: Yup.string()
      .required('Password confirmation is required')
      .label('Confirm password')
      .test('passwords-match', 'Passwords must match', function (value) {
        // eslint-disable-next-line no-invalid-this
        return this.parent.password === value;
      }),
    userName: Yup.string()
      .required('Please enter your name')
      .max(
        150,
        'Username is too long. It must have fewer than 150 characters.'
      ),
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
          <h4>
            To automatically join the group, please sign up with the email
            address that received the invite.
          </h4>
        </div>
      );
    default:
      return <></>;
  }
}

export default SignupPage;
