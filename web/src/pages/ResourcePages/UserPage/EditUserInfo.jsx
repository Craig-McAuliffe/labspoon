import React, {useContext} from 'react';
import * as Yup from 'yup';
import {Formik, Form} from 'formik';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import {db} from '../../../firebase';
import FormTextInput from '../../../components/Forms/FormTextInput';
import {useHistory, useParams} from 'react-router-dom';
import {UnpaddedPageContainer} from '../../../components/Layout/Content';
import {AuthContext} from '../../../App';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import GeneralError from '../../../components/GeneralError';

import './UserPage.css';
import './EditUserPage.css';

export default function EditUserInfo({children}) {
  const {user, userProfile, authLoaded} = useContext(AuthContext);
  const userPageID = useParams().userID;
  const userID = user.uid;
  const history = useHistory();

  if (userID !== userPageID) {
    history.push(`/user/${userPageID}`);
    return null;
  }
  if (!userProfile && authLoaded === false) return <LoadingSpinner />;
  if (!userProfile && authLoaded) return <GeneralError />;

  const validationSchema = Yup.object({
    institution: Yup.string().max(
      300,
      'Institution name must contain fewer than 300 characters.'
    ),
    position: Yup.string().max(
      150,
      'Position title must contain fewer than 150 characters.'
    ),
  });

  const initialValues = {
    institution: userProfile.institution ? userProfile.institution : '',
    position: userProfile.position ? userProfile.position : '',
  };

  const onSubmit = (values) => {
    // Any edits to user that appear on UserRef must update in all the places in which
    // userRef is stored
    const userDocRef = db.doc(`users/${userID}`);
    userDocRef
      .update(values)
      .catch((err) => {
        console.log(err);
        alert(
          `We couldn't update your profile. Sorry about that. Please try again later.`
        );
      })
      .then(() => history.push(`/user/${userID}`));
  };

  return (
    <UnpaddedPageContainer>
      {children}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="edit-user-profile-form">
          <FormTextInput label="Institution" name="institution" />
          <FormTextInput label="Position" name="position" />
        </Form>
      </Formik>

      <div className="create-group-submit-cancel-container">
        <div className="create-group-cancel">
          <CancelButton cancelAction={() => history.push(`/user/${userID}`)} />
        </div>
        <div className="create-group-submit">
          <PrimaryButton submit formID="edit-user-profile-form">
            Save Changes
          </PrimaryButton>
        </div>
      </div>
    </UnpaddedPageContainer>
  );
}
