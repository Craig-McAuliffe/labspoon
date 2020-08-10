import React from 'react';
import Image from 'react-bootstrap/Image';

import 'bootstrap/dist/css/bootstrap.min.css';
import './UserAvatar.css';

const UserAvatar = ({src, width}) => {
  return (
    <Image
      className="post-header-avatar"
      src={src}
      roundedCircle
      width={width}
    />
  );
};

export default UserAvatar;
