import React from 'react';

import './ImageFeedItem.css';

export default function ImageFeedItem({src, alt}) {
  return <img src={src} alt={alt} className="image-feedItem-image" />;
}
