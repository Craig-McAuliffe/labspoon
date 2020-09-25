import React, {useRef, useEffect} from 'react';

import './ImageListItem.css';

export default function ImageListItem({src, alt}) {
  const imageContainerRef = useRef();
  useEffect(() => {
    imageContainerRef.current.style.backgroundImage = `url(${src})`;
  });
  return (
    <div className="image-list-item-container" ref={imageContainerRef}></div>
  );
}
