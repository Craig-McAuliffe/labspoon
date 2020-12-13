import React from 'react';

const VideoListItem = ({src}) => (
  <div>
    <iframe
      width="100%"
      height="450vw"
      src={src}
      frameBorder="0"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

export default VideoListItem;
