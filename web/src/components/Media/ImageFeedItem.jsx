import React, {useRef, useEffect} from 'react';

import './ImageFeedItem.css';

export default function ImageFeedItem({src, alt}) {
  const imageContainerRef = useRef();
  useEffect(() => {
    imageContainerRef.current.style.backgroundImage = `url(${src})`;
  });
  return (
    <div className="image-list-item-container" ref={imageContainerRef}></div>
  );
}
