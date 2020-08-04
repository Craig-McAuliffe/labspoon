import React from 'react';
import Image from 'react-bootstrap/Image';

import 'bootstrap/dist/css/bootstrap.min.css';
import './UserAvatar.css';

const UserAvatar = ({src, alt}) => {
  return (
    <Image
      className="post-header-avatar"
      src={src}
      roundedCircle
      width="60px"
      alt={alt}
    />
  );
};

export default UserAvatar;
