import React, {useRef, useEffect} from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getDefaultCoverPhoto} from '../../helpers/users';

import './UserCoverPhoto.css';

export default function UserCoverPhoto({src, alt, spinner}) {
  const imageContainerRef = useRef();
  useEffect(() => {
    imageContainerRef.current.style.backgroundImage = `url(${
      src ? src : getDefaultCoverPhoto()
    })`;
  });
  return (
    <div
      className={'cover-image-container'}
      ref={imageContainerRef}
      title={alt}
    >
      {spinner ? (
        <div className="image-spinner-container">
          <LoadingSpinner />
        </div>
      ) : null}
    </div>
  );
}
