import React from 'react';
import {Alert} from 'react-bootstrap';
import {storage} from '../../../firebase';
import {useParams} from 'react-router-dom';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import ImageUpload from '../../../components/Images/ImageUpload';

import './EditUserPage.css';

export default function EditUserPhotos({children}) {
  return (
    <PaddedPageContainer>
      {children}
      <EditUserProfilePicture />
      <EditUserCoverPicture />
      <p className="photo-cache-notice">
        <Alert variant="warning">
          <b>Note:</b> Photos may not update immediately subject to your browser
          cache. We are looking into a fix for this. In the meantime to speed up
          the reload, you can clear your browser cache or view your profile in
          an incognito window.
        </Alert>
      </p>
    </PaddedPageContainer>
  );
}

export function EditUserProfilePicture({setSuccess}) {
  const userID = useParams().userID;
  return (
    <div className="edit-user-photos-section">
      <h2>Profile Picture</h2>
      <ImageUpload
        storageRef={storage.ref(`users/${userID}/avatar_fullSize`)}
      />
    </div>
  );
}

export function EditUserCoverPicture({setSuccess}) {
  const userID = useParams().userID;
  return (
    <div className="edit-user-photos-section">
      <h2>Cover Picture</h2>
      <ImageUpload
        storageRef={storage.ref(`users/${userID}/coverPhoto_fullSize`)}
        cover={true}
      />
    </div>
  );
}
