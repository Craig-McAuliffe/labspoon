import React, {useContext, useState} from 'react';
import firebase, {db} from '../../firebase.js';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {Redirect, useHistory} from 'react-router';
import {AuthContext} from '../../App';
import {Form, Formik} from 'formik';
import CancelButton from '../../components/Buttons/CancelButton';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FormTextInput from '../../components/Forms/FormTextInput';
import * as Yup from 'yup';

import './LoginPage.css';

/**
 * Sign in page using the Firebase authentication handler
 * @param {Function} setUser - function that updates the auth context upon a
 * sign in event
 * @return {React.ReactElement}
 */
function LoginPage() {
  const {user} = useContext(AuthContext);
  const [signUpFlow, setSignUpFlow] = useState(false);
  const history = useHistory();
  const UIConfig = {
    signInFlow: 'popup',
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };

  const SignUpForm = () => {
    const submitChanges = (values) => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(values.email, values.password)
        .then((result) => {
          result.user
            .updateProfile({displayName: values.userName})
            .then(() =>
              db.doc(`users/${result.user.uid}`).set({
                id: result.user.uid,
                name: result.user.displayName,
              })
            )
            .then(() => {
              alert(`Welcome to Labspoon!`);
              history.push('/');
            })
            .catch((error) => {
              console.log(error, 'Could not create display name');
            });
        })
        .catch((error) => {
          console.log(error);
          if (
            error.message.includes(
              'The email address is already in use by another account.'
            )
          ) {
            alert(
              `There is already a Labspoon account linked to that address.`
            );
          } else {
            alert(
              'Something went wrong. We will look into it. Please try signing up later.'
            );
            setSignUpFlow(false);
          }
        });
    };

    const initialValues = {
      email: '',
      password: '',
      confirmPassword: '',
      userName: '',
    };

    const cancelSignUp = () => {
      setSignUpFlow(false);
    };

    const validationSchema = Yup.object({
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long.')
        .matches(
          /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
          'Password must contain a mixture of numbers and letters.'
        ),
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
          <h2 className="signin-form-title">{`Just a few details then you'll be spooning away...`}</h2>
          <FormTextInput name="email" autoComplete="email" label="Email" />
          <p className="password-tip">{`Tip: Don't forget to make your password at least 8 digits long and include a number.`}</p>
          <FormTextInput
            name="password"
            label="Password"
            passwordInput={true}
          />
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
            <CancelButton cancelAction={cancelSignUp} />
            <div className="submit-button-container">
              <PrimaryButton submit={true}>Sign Up</PrimaryButton>
            </div>
          </div>
        </Form>
      </Formik>
    );
  };

  if (!user) {
    return (
      <div className="content-layout">
        <div className="page-content-container">
          {signUpFlow ? (
            <div className="sign-up-form">
              <SignUpForm />
            </div>
          ) : (
            <>
              <StyledFirebaseAuth
                uiConfig={UIConfig}
                firebaseAuth={firebase.auth()}
              />
              <div className="sign-up-container">
                <h2 className="sign-up-container-title">Not a user yet?</h2>
                <PrimaryButton onClick={() => setSignUpFlow(true)}>
                  Sign up
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    );
  } else {
    return <Redirect to="/" />;
  }
}

export default LoginPage;
