import React, {useState} from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import firebase, {db, storage} from '../../../firebase';
import SubmitButton from '../../../components/Buttons/SubmitButton';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import FormTextInput from '../../../components/Forms/FormTextInput';
import {Link, useParams} from 'react-router-dom';
import ImageUploader from 'react-images-upload';

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
      <Link to={`/user/${user.id}/edit/profilePicture`}>
        <h3>Update Profile Picture</h3>
      </Link>
      <Link to={`/user/${user.id}/edit/coverPhoto`}>
        <h3>Update Cover Photo</h3>
      </Link>
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

export function EditUserCoverPhotoPage() {
  const userID = useParams().userID;
  return (
    <div>
      <h1>Edit Cover Photo</h1>
      <UploadImage
        storageRef={storage.ref(`users/${userID}/coverPhoto_fullSize`)}
      />
    </div>
  );
}

export function EditUserProfilePicturePage() {
  const userID = useParams().userID;
  return (
    <div>
      <h1>Edit Profile Picture</h1>
      <UploadImage
        storageRef={storage.ref(`users/${userID}/avatar_fullSize`)}
      />
    </div>
  );
}

function UploadImage({storageRef}) {
  const [image, setImage] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  function submit() {
    setUploading(true);
    storageRef.put(image[0], {contentType: image[0].type}).on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // TODO: implement loading symbol
        console.log('snapshot', snapshot);
      },
      (err) => {
        alert(`failed to write image ${err}`);
      },
      () => {
        setUploading(false);
        setUploaded(true);
      }
    );
  }

  return (
    <div>
      <ImageUploader
        onChange={(selectedImage) => setImage(selectedImage)}
        imgExtension={['.jpg', '.png']}
        singleImage
        withPreview
        withIcon={false}
        buttonStyles={{background: '#00507c'}}
      />
      <SubmitButton inputText="Submit" onClick={submit} />
      {uploading ? <h3>Uploading...</h3> : <></>}
      {uploaded ? <h3>Uploaded!</h3> : <></>}
    </div>
  );
}
