import React, {useState} from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import firebase, {db, storage} from '../../../firebase';
import SubmitButton from '../../../components/Buttons/SubmitButton';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import FormTextInput from '../../../components/Forms/FormTextInput';
import {useHistory, useParams} from 'react-router-dom';
import ImageUploader from 'react-images-upload';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {fetchUserDetailsFromDB} from './UserPage';

import './UserPage.css';

export default function EditUserPage({user}) {
  const [userDetails, setUserDetails] = useState(user);
  const [editingProfilePicture, setEditingProfilePicture] = useState(false);
  const [editingCoverPicture, setEditingCoverPicture] = useState(false);
  const userID = useParams().userID;
  const history = useHistory();
  const onSubmit = (values) => {
    // Any edits to user that appear on UserRef must update in all the places in which
    // userRef is stored
    const userDocRef = db.doc(`users/${userDetails.id}`);
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

  if (userDetails === undefined) {
    fetchUserDetailsFromDB(userID)
      .then((userDetails) => {
        if (!userDetails) {
          history.push('/notfound');
        }
        setUserDetails(userDetails);
      })
      .catch((err) => console.log(err));
  }

  if (userDetails === undefined) return null;

  const validationSchema = Yup.object({
    institution: Yup.string(),
    position: Yup.string(),
  });

  const initialValues = {
    institution: userDetails.institution,
    position: userDetails.position,
  };
  return (
    <div className="content-layout">
      <div className="details-container">
        <div className="edit-user-profile-change-picture-section">
          <button
            className="update-picture-button"
            onClick={() =>
              setEditingProfilePicture((editingState) => !editingState)
            }
          >
            <h3>Update Profile Picture</h3>
          </button>
          {editingProfilePicture ? (
            <div className="edit-user-profile-expanded-upload-picture-section">
              <EditUserProfilePicturePage />{' '}
            </div>
          ) : null}
        </div>
        <div className="edit-user-profile-change-picture-section">
          <button
            className="update-picture-button"
            onClick={() =>
              setEditingCoverPicture((editingState) => !editingState)
            }
          >
            <h3>Update Cover Photo</h3>
          </button>
          {editingCoverPicture ? (
            <div className="edit-user-profile-expanded-upload-picture-section">
              <EditUserCoverPhotoPage />
            </div>
          ) : null}
        </div>
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
            <CancelButton
              cancelAction={() => history.push(`/user/${userID}`)}
            />
          </div>
          <div className="create-group-submit">
            <PrimaryButton submit formID="edit-user-profile-form">
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditUserCoverPhotoPage() {
  const userID = useParams().userID;
  return (
    <UploadImage
      storageRef={storage.ref(`users/${userID}/coverPhoto_fullSize`)}
    />
  );
}

export function EditUserProfilePicturePage() {
  const userID = useParams().userID;
  return (
    <UploadImage
      storageRef={storage.ref(`users/${userID}/avatar_fullSize`)}
      userID={userID}
    />
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
    <>
      <div className="edit-user-profile-upload-image-container">
        <ImageUploader
          onChange={(selectedImage) => setImage(selectedImage)}
          imgExtension={['.jpg', '.png']}
          singleImage
          withPreview
          withIcon={false}
          buttonStyles={{background: '#00507c'}}
        />
      </div>
      <div className="edit-user-profile-submit-image-container">
        <SubmitButton inputText="Upload" onClick={submit} />
      </div>
      {uploading ? <LoadingSpinner /> : <></>}
      {uploaded ? <LoadingSpinner /> : <></>}
    </>
  );
}
