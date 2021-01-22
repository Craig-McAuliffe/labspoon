import React, {useContext, useState} from 'react';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {auth, db} from '../../../firebase.js';
import * as Yup from 'yup';
import {Form, Formik} from 'formik';
import FormTextInput from '../../../components/Forms/FormTextInput';
import PrimaryButton from '../../../components/Buttons/PrimaryButton.jsx';
import {AuthContext} from '../../../App.jsx';
import {useLocation, Redirect} from 'react-router-dom';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';

export default function ChooseUserName() {
  const locationState = useLocation().state;
  const returnLocation = locationState ? locationState.returnLocation : '';
  const {user, userProfile, authLoaded} = useContext(AuthContext);
  const {updateUserDetails} = useContext(AuthContext);
  const [goToOnboarding, setGoToOnboarding] = useState(false);

  const initialValues = {
    userName: '',
  };

  const validationSchema = Yup.object({
    userName: Yup.string()
      .required('Please enter your name')
      .max(
        150,
        'Too long! Your username must contain fewer than 150 characters.'
      ),
  });

  const submitUserName = async (values) => {
    if (!userProfile) await updateUserDetails(user);
    if (!userProfile)
      return alert(
        'We are unable to fetch your user details at the moment. Please try again later.'
      );
    await db
      .doc(`users/${userProfile.id}`)
      .update({name: values.userName})
      .then(async () => {
        await updateUserDetails({uid: userProfile.id});
        await auth.currentUser
          .updateProfile({
            displayName: values.userName,
          })
          .catch((error) => console.error(error));
        setGoToOnboarding(true);
      })
      .catch((err) => {
        console.error(err);
        alert(
          'Something went wrong trying to create your user name. Please refresh the page and try again.'
        );
      });
  };

  if (!authLoaded) return <LoadingSpinnerPage />;
  if (!user) {
    return <Redirect to="/" />;
  }

  if (goToOnboarding)
    return (
      <Redirect
        to={{
          pathname: '/onboarding/follow',
          state: {returnLocation: returnLocation},
        }}
      />
    );

  return (
    <PaddedPageContainer>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitUserName}
      >
        <Form>
          <FormTextInput
            name="userName"
            label="Your Full Name (this will be displayed on your profile)"
          />
          <div className="signup-submit-button-container">
            <PrimaryButton type="submit">Submit</PrimaryButton>
          </div>
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}
