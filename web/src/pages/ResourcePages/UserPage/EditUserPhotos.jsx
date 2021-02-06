import React, {useContext} from 'react';
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
  return (
    <PaddedPageContainer>
      {children}
      <EditUserProfilePicture userID={userID} />
      <EditUserCoverPicture userID={userID} />
    </PaddedPageContainer>
  );
}

export function EditUserProfilePicture({userID}) {
  return (
    <div className="edit-user-photos-section">
      <h2>Profile Picture</h2>
      <p className="resize-images-note">Cropped to a 200x200 pixel square.</p>
      <ImageUpload
        storageDir={`users/${userID}/avatar`}
        isAvatar={true}
        shouldResize={true}
      />
    </div>
  );
}

export function EditUserCoverPicture({userID}) {
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
        shouldResize={true}
      />
    </div>
  );
}
