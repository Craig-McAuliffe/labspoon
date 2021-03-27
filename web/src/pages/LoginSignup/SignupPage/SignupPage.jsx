import React, {useContext, useState} from 'react';
import qs from 'qs';
import firebase, {db} from '../../../firebase.js';
import {Link, Redirect, useLocation} from 'react-router-dom';
import {AuthContext} from '../../../App';
import {Form, Formik} from 'formik';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import FormTextInput from '../../../components/Forms/FormTextInput';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import * as Yup from 'yup';
import {createUserDocOnSignUp} from '../../../helpers/users.js';
import GoogleButton from 'react-google-button';
import {PaddedPageContainer} from '../../../components/Layout/Content.jsx';
import GoogleSignIn from '../GoogleSignIn.jsx';
import {reCaptchaSiteKey} from '../../../config';
import useScript from '../../../helpers/useScript';
import useDomRemover from '../../../helpers/useDomRemover.js';
import reCaptcha from '../../../helpers/activity.js';
import {convertGroupToGroupRef} from '../../../helpers/groups.js';
import './SignupPage.css';

/**
 * Sign up page using the Firebase authentication handler
 * @return {React.ReactElement}
 */
function SignupPage() {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const locationState = useLocation().state;
  const search = useLocation().search;
  const returnLocation = locationState
    ? locationState.returnLocation
    : undefined;
  const claimGroupID = locationState ? locationState.claimGroupID : undefined;
  const {userProfile} = useContext(AuthContext);
  const {updateUserDetails} = useContext(AuthContext);
  const searchParams = qs.parse(search.slice(1));
  const referrer = searchParams.referrer;
  const [googleSignInFlow, setGoogleSignInFlow] = useState(false);
  const [savedInitialValues, setSavedInitialValues] = useState(false);

  useScript(
    `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`
  );

  useDomRemover('.grecaptcha-badge');

  if (!userProfile || isSigningUp) {
    return (
      <PaddedPageContainer>
        {googleSignInFlow && (
          <GoogleSignIn
            updateUserDetails={updateUserDetails}
            setIsSigningUp={setIsSigningUp}
            setGoogleSignInFlow={setGoogleSignInFlow}
            claimGroupID={claimGroupID}
          />
        )}
        <ReferrerAlert referrer={referrer} />
        <h2 className="signup-form-title">{`Sign up to Labspoon`}</h2>
        <p className="signup-option">
          Already have an account?{' '}
          <Link to={{pathname: '/login', state: locationState}}>
            Login here
          </Link>
        </p>
        <div className="sign-up-form">
          <SignUpForm
            setIsSigningUp={setIsSigningUp}
            setSavedInitialValues={setSavedInitialValues}
            savedInitialValues={savedInitialValues}
            claimGroupID={claimGroupID}
            isSigningUp={isSigningUp}
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
            state: {returnLocation: returnLocation, claimGroupID: claimGroupID},
          }}
        />
      );
    if (userProfile.hasCompletedOnboarding && returnLocation)
      return <Redirect to={returnLocation} />;
    if (userProfile.hasCompletedOnboarding) return <Redirect to="/" />;
    return (
      <Redirect
        to={{
          pathname: '/onboarding/link-author',
          state: {returnLocation: returnLocation, claimGroupID: claimGroupID},
        }}
      />
    );
  }
}

const SignUpForm = ({
  setIsSigningUp,
  setSavedInitialValues,
  savedInitialValues,
  claimGroupID,
  isSigningUp,
}) => {
  const {updateUserDetails} = useContext(AuthContext);

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
        100,
        'Username is too long. It must have fewer than 100 characters.'
      ),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) =>
        submitSignUp(
          values,
          setIsSigningUp,
          updateUserDetails,
          setSavedInitialValues,
          claimGroupID
        )
      }
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
          <PrimaryButton disabled={isSigningUp} submit={true}>
            Sign Up
          </PrimaryButton>
        </div>
        {isSigningUp && <LoadingSpinner />}
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
// isSigningUp is
export async function submitSignUp(
  values,
  setIsSigningUp,
  updateUserDetails,
  setSavedInitialValues,
  claimGroupID
) {
  if (setIsSigningUp) setIsSigningUp(true);
  const defaultAlert = () =>
    alert(
      'Something went wrong. Please try refreshing the page and signing up again.'
    );
  const authenticateThenUpdateDB = () =>
    firebase
      .auth()
      .createUserWithEmailAndPassword(values.email, values.password)
      .then(async (result) => {
        await createUserDocOnSignUp(result, values.userName, updateUserDetails);
        if (claimGroupID)
          await claimGroupFromTwitter(
            claimGroupID,
            values.userName,
            result.user.uid
          );
        if (setIsSigningUp) setIsSigningUp(false);
      })
      .catch((error) => {
        console.error(error);
        if (setIsSigningUp) setIsSigningUp(false);
        if (
          error.message.includes(
            'The email address is already in use by another account.'
          )
        ) {
          alert(`There is already a Labspoon account linked to that address.`);
        } else {
          defaultAlert();
        }
        if (setIsSigningUp) setIsSigningUp(false);
        return false;
      });

  const reCaptchaFailFunction = () => {
    setSavedInitialValues(values);
    alert('Our security system thinks you might be a bot. Please try again');
    if (setIsSigningUp) setIsSigningUp(false);
    return false;
  };
  const reCaptchaErrorFunction = () => {
    setSavedInitialValues(values);
    defaultAlert();
    if (setIsSigningUp) setIsSigningUp(false);
    return false;
  };

  return reCaptcha(
    0.4,
    'sign_up',
    authenticateThenUpdateDB,
    reCaptchaFailFunction,
    reCaptchaErrorFunction
  );
}

export async function claimGroupFromTwitter(
  claimGroupID,
  userName,
  userID,
  group
) {
  const groupData = group
    ? group
    : await db
        .doc(`groups/${claimGroupID}`)
        .get()
        .then((ds) => ds.data())
        .catch((err) => console.error(err));
  if (groupData) {
    const batch = db.batch();
    batch.set(db.doc(`groups/${claimGroupID}/members/${userID}`), {
      id: userID,
      name: userName,
    });
    batch.set(
      db.doc(`users/${userID}/groups/${claimGroupID}`),
      convertGroupToGroupRef(groupData, claimGroupID)
    );
    batch.update(db.doc(`groups/${claimGroupID}`), {
      isGeneratedFromTwitter: false,
    });
    return batch.commit().catch((err) => {
      console.error(err);
      <alert>
        Something went wrong while claiming that group. Go to the group page and
        try again.
      </alert>;
    });
  }
}

export default SignupPage;
