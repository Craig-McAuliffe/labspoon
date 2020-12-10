import React, {useRef, useEffect} from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './ImageListItem.css';

export default function ImageListItem({src, alt, spinner}) {
  const imageContainerRef = useRef();
  useEffect(() => {
    imageContainerRef.current.style.backgroundImage = `url(${src})`;
  });
  return (
    <div className="image-list-item-container" ref={imageContainerRef}>
      {spinner ? (
        <div className="image-spinner-container">
          <LoadingSpinner />
        </div>
      ) : null}
    </div>
  );
}
