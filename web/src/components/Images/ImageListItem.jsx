import React, {useRef, useEffect} from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './ImageListItem.css';

export default function ImageListItem({
  src,
  alt,
  spinner,
  selectAction,
  selectText,
  id,
  selectedIDs,
  deselectAction,
  deselectText,
}) {
  const imageContainerRef = useRef();
  useEffect(() => {
    imageContainerRef.current.style.backgroundImage = `url(${src})`;
  });

  const isSelected = selectedIDs ? selectedIDs.includes(id) : false;
  let isGreyedOut = false;
  if (spinner) isGreyedOut = true;
  if (isSelected) isGreyedOut = true;
  const selectorDisplay = () => {
    let selectorText = selectText ? selectText : 'Select';
    if (isSelected) selectorText = deselectText ? deselectText : 'Deselect';
    const selectOrDeselectAction = () =>
      isSelected
        ? deselectAction({src: src, id: id})
        : selectAction({src: src, id: id});

    return (
      <button
        className={`image-selector-container${isSelected ? '-deselected' : ''}`}
        onClick={selectOrDeselectAction}
      >
        <div className="secondary-button-style">
          <h3>{selectorText}</h3>
        </div>
      </button>
    );
  };

  let imageContainerClassName = 'image-list-item-image-div';
  if (selectAction && deselectAction && selectedIDs)
    imageContainerClassName = imageContainerClassName + '-with-selector';
  if (isGreyedOut)
    imageContainerClassName = imageContainerClassName + '-greyed-out';

  return (
    <div className="image-list-item-container">
      <div
        className={imageContainerClassName}
        ref={imageContainerRef}
        title={alt}
      ></div>
      {spinner && (
        <div className="image-spinner-container">
          <LoadingSpinner />
        </div>
      )}
      {selectAction &&
        deselectAction &&
        selectedIDs &&
        !spinner &&
        selectorDisplay()}
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
  selectedIDs,
  deselectAction,
  deselectText,
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
              selectedIDs={selectedIDs}
              deselectAction={deselectAction}
              deselectText={deselectText}
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
