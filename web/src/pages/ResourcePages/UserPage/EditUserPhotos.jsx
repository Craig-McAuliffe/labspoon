import React, {useContext} from 'react';
import {useParams} from 'react-router-dom';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import ImageUpload from '../../../components/Images/ImageUpload';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {db} from '../../../firebase';

import './EditUserPage.css';

export default function EditUserPhotos({children}) {
  const {userProfile} = useContext(AuthContext);
  const userID = useParams().userID;
  if (!userProfile) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      {children}
      <EditUserProfilePicture userID={userID} />
      <EditUserCoverPicture userID={userID} />
    </PaddedPageContainer>
  );
}

export function EditUserProfilePicture({userID}) {
  const addAvatarToGroupDoc = async (url, photoID) => {
    return addToUserDoc(url, 'avatar', userID, photoID, 'avatarCloudID');
  };

  return (
    <div className="edit-user-photos-section">
      <h2>Profile Picture</h2>
      <p className="resize-images-note">Cropped to a 200x200 pixel square.</p>
      <ImageUpload
        storageDir={`users/${userID}/avatar`}
        isAvatar={true}
        updateDB={addAvatarToGroupDoc}
        resizeOptions={[
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

export function EditUserCoverPicture({userID}) {
  const addCoverPhotoToUserDoc = async (url, photoID) =>
    addToUserDoc(url, 'coverPhoto', userID, photoID, 'coverPhotoCloudID');

  return (
    <div className="edit-user-photos-section">
      <h2>Cover Picture</h2>
      <p className="resize-images-note">
        Cropped to a 1070x200 pixel rectangle.
      </p>
      <ImageUpload
        storageDir={`users/${userID}/coverPhoto`}
        isCover={true}
        noGif={true}
        updateDB={addCoverPhotoToUserDoc}
        resizeOptions={[
          '-thumbnail',
          '1605x300^',
          '-gravity',
          'center',
          '-extent',
          '1605x300',
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
