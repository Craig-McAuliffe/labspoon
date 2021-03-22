import React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getDefaultCoverPhoto} from '../../helpers/users';
import {getDefaultGroupCoverPhoto} from '../../helpers/groups';

import './UserCoverPhoto.css';

export default function UserCoverPhoto({src, alt, spinner, isGroup}) {
  return (
    <>
      <img
        className={spinner ? 'cover-image-greyed' : 'cover-image'}
        title={alt}
        src={src ? src : getDefaultCoverPhoto()}
        alt={`cover for user page`}
        onError={(img) =>
          (img.target.src = isGroup
            ? getDefaultGroupCoverPhoto()
            : getDefaultCoverPhoto())
        }
      />
      {spinner && (
        <div className="cover-image-spinner-container">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
