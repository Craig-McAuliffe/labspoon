import React, {useRef, useEffect} from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './ImageListItem.css';

export default function ImageListItem({src, alt, spinner}) {
  const imageContainerRef = useRef();
  useEffect(() => {
    imageContainerRef.current.style.backgroundImage = `url(${src})`;
  });
  return (
    <div
      className="image-list-item-container"
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

export function ImagesSection({images}) {
  if (images.length === 0) return null;
  return (
    <div className="images-section">
      {images.map((image) => (
        <ImageListItem
          key={image.id + 'image'}
          src={image.src}
          alt={image.alt ? image.alt : `image from source ${image.src}`}
        />
      ))}
    </div>
  );
}

export function formatTaggedImages(photoURLs) {
  return photoURLs.map((photoURL) => {
    return {src: photoURL, alt: 'image from source photoURL'};
  });
}
