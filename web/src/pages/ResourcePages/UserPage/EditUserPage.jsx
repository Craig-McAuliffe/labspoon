import React, {useState} from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {Alert} from 'react-bootstrap';
import firebase, {db, storage} from '../../../firebase';
import SubmitButton from '../../../components/Buttons/SubmitButton';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import CancelButton from '../../../components/Buttons/CancelButton';
import FormTextInput from '../../../components/Forms/FormTextInput';
import {useHistory, useParams} from 'react-router-dom';
import ImageUploader from 'react-images-upload';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {fetchUserDetailsFromDB} from './UserPage';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import LinkAuthorIDForm from '../../../components/Publication/ConnectToPublications/ConnectToPublications';

import './UserPage.css';
import './EditUserPage.css';

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
    institution: userDetails.institution ? userDetails.institution : '',
    position: userDetails.position ? userDetails.position : '',
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
          {editingProfilePicture ? <EditUserProfilePicturePage /> : null}
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
          {editingCoverPicture ? <EditUserCoverPhotoPage /> : null}
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
        <LinkUserToPublications
          authorID={userDetails.microsoftAcademicAuthorID}
        />
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
    <div>
      <Alert variant="warning">
        Cover photos will be cropped to a 1070x200 pixel rectangle, for precise
        positioning please match this size before uploading. Cover photos may
        not update immediately subject to your browser cache, we are looking
        into a fix for this. In the meantime to speed up the reload, you can
        clear your browser cache or view your profile in an incognito window.
      </Alert>
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
      <Alert variant="warning">
        Profile pictures will be cropped to a 200x200 pixel square, for precise
        positioning please match this size before uploading. Profile pictures
        may not update immediately subject to your browser cache, we are looking
        into a fix for this. In the meantime to speed up the reload, you can
        clear your browser cache or view your profile in an incognito window.
      </Alert>
      <UploadImage
        storageRef={storage.ref(`users/${userID}/avatar_fullSize`)}
        userID={userID}
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
    <div className="edit-user-profile-expanded-upload-picture-section">
      <div className="edit-user-profile-upload-image-container">
        <ImageUploader
          onChange={(selectedImage) => setImage(selectedImage)}
          imgExtension={['.jpg', '.png']}
          singleImage
          withPreview
          withIcon={false}
          buttonStyles={{background: '#00507c'}}
          buttonText="Choose Image"
        />
      </div>
      {image.length === 0 ? null : (
        <div className="edit-user-profile-submit-image-button-container">
          <SubmitButton inputText="Upload" onClick={submit} />
        </div>
      )}
      {uploading ? <LoadingSpinner /> : <></>}
      {uploaded ? <h1>Success</h1> : <></>}
    </div>
  );
}

function LinkUserToPublications({authorID}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
  const cancel = () => setLinkingAuthor(false);
  if (linkingAuthor)
    return <LinkAuthorIDForm cancel={cancel} submitBehaviour={cancel} />;

  if (authorID)
    return (
      <div className="link-user-to-publications-button-container">
        <h3>You have linked publications to your user profile</h3>
        <p>
          We are constantly indexing more publications, so if any are missing
          they will probably appear soon. If you want to speed up this process
          for a specific publication, just search for it in the header search
          bar
        </p>
      </div>
    );

  return (
    <div className="link-user-to-publications-button-container">
      <SecondaryButton onClick={() => setLinkingAuthor(true)}>
        Connect publications to profile
      </SecondaryButton>
    </div>
  );
}
