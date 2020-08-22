import React from 'react';
import Image from 'react-bootstrap/Image';

import 'bootstrap/dist/css/bootstrap.min.css';
import './UserAvatar.css';

const UserAvatar = ({src, width, height}) => {
  return (
    <Image
      className="user-avatar"
      src={src}
      roundedCircle
      width={width}
      height={height}
    />
  );
};

export const UserPageAvatar = ({src, width, height}) => {
  return (
    <Image
      className="userPage-avatar"
      src={src}
      roundedCircle
      width={width}
      height={height}
    />
  );
};

export default UserAvatar;
