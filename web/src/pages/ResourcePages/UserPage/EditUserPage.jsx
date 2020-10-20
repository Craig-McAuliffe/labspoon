import React from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {db} from '../../../firebase';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import FormTextInput from '../../../components/Forms/FormTextInput';

export default function EditUserPage({user, cancelEdit}) {
  const onSubmit = (values) => {
    // Any edits to user that appear on UserRef must update in all the places in which
    // userRef is stored
    const userDocRef = db.doc(`users/${user.id}`);
    userDocRef
      .update(values)
      .catch((err) => {
        console.log(err);
        alert(
          `We couldn't update your profile. Sorry about that. Please try again later.`
        );
      })
      .then(() => cancelEdit());
  };

  const validationSchema = Yup.object({
    institution: Yup.string(),
    position: Yup.string(),
  });

  const initialValues = {
    institution: user.institution,
    position: user.position,
  };
  return (
    <div className="details-container">
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
          <CancelButton cancelAction={cancelEdit} />
        </div>
        <div className="create-group-submit">
          <PrimaryButton submit formID="edit-user-profile-form">
            Save Changes
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
