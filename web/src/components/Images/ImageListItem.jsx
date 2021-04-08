import React, {useRef, useEffect} from 'react';
import SecondaryButton from '../Buttons/SecondaryButton';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './ImageListItem.css';

export default function ImageListItem({
  src,
  alt,
  spinner,
  selectAction,
  selectText,
  id,
}) {
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
      {selectAction && (
        <div className="image-spinner-container">
          <SecondaryButton onClick={() => selectAction({src: src, id: id})}>
            {selectText ? selectText : 'Select'}
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}

export function ImagesSection({
  children,
  images,
  spinner,
  customMargin,
  selectAction,
  selectText,
}) {
  if (!children && !images) return null;
  if (images) {
    if (images.length === 0) return null;
  }

  const customMarginStyle = customMargin
    ? {
        marginTop: customMargin,
        marginBottom: customMargin,
      }
    : null;

  return (
    <div className="images-section" style={customMarginStyle}>
      {images
        ? images.map((image, i) => (
            <ImageListItem
              src={image.src}
              alt={'unknown'}
              spinner={spinner}
              key={image.src + i}
              selectAction={selectAction}
              selectText={selectText}
              id={image.id}
            />
          ))
        : children}
    </div>
  );
}

export function formatTaggedImages(photoURLs) {
  return photoURLs.map((photoURL) => {
    return {src: photoURL, alt: `unknown`};
  });
}
