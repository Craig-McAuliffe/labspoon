import React, {useContext, useState} from 'react';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import firebase, {auth, db} from '../../../firebase';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import FormTextInput from '../../../components/Forms/FormTextInput';
import {AuthContext} from '../../../App.jsx';
import {useLocation, Redirect} from 'react-router-dom';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import CreateResourceFormActions from '../../../components/Forms/CreateResourceFormActions';

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
        100,
        'Too long! Your username must contain fewer than 100 characters.'
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
      .update({
        name: values.userName,
        nameChangeTimeStamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
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
        if (err.message.includes('PERMISSION_DENIED'))
          alert(
            'You can only change your username every 100 days. Please contact support if something has gone wrong when setting up your username.'
          );
        else
          alert(
            'Something went wrong trying to create your user name. Please refresh the page and try again.'
          );
      });
  };

  if (!authLoaded) return <LoadingSpinnerPage />;
  if (!user) {
    return <Redirect to={returnLocation ? returnLocation : '/'} />;
  }

  if (goToOnboarding)
    return (
      <Redirect
        to={{
          pathname: '/onboarding/link-author',
          state: locationState,
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
          <CreateResourceFormActions submitText="Submit" noBorder={true} />
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}
