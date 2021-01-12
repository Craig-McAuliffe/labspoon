import React, {useContext} from 'react';
import {Alert} from 'react-bootstrap';
import {db, storage} from '../../../firebase';
import {useParams} from 'react-router-dom';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import ImageUpload from '../../../components/Images/ImageUpload';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';

import './EditUserPage.css';

export default function EditUserPhotos({children}) {
  const {userProfile} = useContext(AuthContext);
  const userID = useParams().userID;
  if (!userProfile) return <LoadingSpinnerPage />;
  const avatarCloudID = userProfile.avatarCloudID;
  const coverPhotoCloudID = userProfile.coverPhotoCloudID;
  return (
    <PaddedPageContainer>
      {children}
      <EditUserProfilePicture userID={userID} avatarCloudID={avatarCloudID} />
      <EditUserCoverPicture
        userID={userID}
        coverPhotoCloudID={coverPhotoCloudID}
      />
      <Alert variant="warning">
        <b>Note:</b> Photos may not update immediately subject to your browser
        cache. We are looking into a fix for this. In the meantime to speed up
        the reload, you can clear your browser cache or view your profile in an
        incognito window.
      </Alert>
    </PaddedPageContainer>
  );
}

export function EditUserProfilePicture({userID, avatarCloudID}) {
  const addAvatarToUserDoc = async (url, photoID) => {
    if (avatarCloudID) {
      const currentAvatarRef = storage.ref(
        `users/${userID}/avatar/${avatarCloudID}`
      );
      await currentAvatarRef
        .delete()
        .catch((err) =>
          console.error(
            'unable to delete avatar for user with id' + userID,
            err
          )
        );
    }
    return addToUserDoc(url, 'avatar', userID, photoID, 'avatarCloudID');
  };

  return (
    <div className="edit-user-photos-section">
      <h2>Profile Picture</h2>
      <ImageUpload
        storageDir={`users/${userID}/avatar`}
        updateDB={addAvatarToUserDoc}
        conversionOptions={[
          '-thumbnail',
          '200x200^',
          '-gravity',
          'center',
          '-extent',
          '200x200',
        ]}
      />
    </div>
  );
}

export function EditUserCoverPicture({userID, coverPhotoCloudID}) {
  const addCoverPhotoToUserDoc = async (url, photoID) => {
    if (coverPhotoCloudID) {
      const currentCoverPhotoRef = storage.ref(
        `users/${userID}/coverPhoto/${coverPhotoCloudID}`
      );
      await currentCoverPhotoRef
        .delete()
        .catch((err) =>
          console.error(
            'unable to delete cover photo for user with id' + userID,
            err
          )
        );
    }
    return addToUserDoc(
      url,
      'coverPhoto',
      userID,
      photoID,
      'coverPhotoCloudID'
    );
  };
  return (
    <div className="edit-user-photos-section">
      <h2>Cover Picture</h2>
      <ImageUpload
        storageDir={`users/${userID}/coverPhoto`}
        cover={true}
        updateDB={addCoverPhotoToUserDoc}
        conversionOptions={[
          '-thumbnail',
          '1070x200^',
          '-gravity',
          'center',
          '-extent',
          '1070x200',
        ]}
      />
    </div>
  );
}

async function addToUserDoc(url, urlField, userID, photoID, photoIDField) {
  return db
    .doc(`users/${userID}`)
    .update({[urlField]: url, [photoIDField]: photoID});
}
