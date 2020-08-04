import React from 'react';
import Image from 'react-bootstrap/Image';

import 'bootstrap/dist/css/bootstrap.min.css';
import './UserAvatar.css';

const UserAvatar = ({src}) => {
  return (
    <Image
      className="post-header-avatar"
      src={src}
      roundedCircle
      width="70px"
    />
  );
};

export default UserAvatar;
