import React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getDefaultCoverPhoto} from '../../helpers/users';

import './UserCoverPhoto.css';

export default function UserCoverPhoto({src, alt, spinner}) {
  return (
    <>
      <img
        className={spinner ? 'cover-image-greyed' : 'cover-image'}
        title={alt}
        src={src ? src : getDefaultCoverPhoto()}
        alt={`cover for user page`}
        onError={(img) => (img.target.src = getDefaultCoverPhoto())}
      />
      {spinner && (
        <div className="cover-image-spinner-container">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
