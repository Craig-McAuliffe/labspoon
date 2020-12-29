import React from 'react';
import Image from 'react-bootstrap/Image';
import {getDefaultAvatar} from '../../helpers/users.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Avatar.css';

const UserAvatar = ({src, width, height}) => {
  return (
    <Image
      className="avatar"
      src={src}
      roundedCircle
      width={width}
      height={height}
      onError={(img) => (img.target.src = getDefaultAvatar())}
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
      onError={(img) => (img.target.src = getDefaultAvatar())}
    />
  );
};

export default UserAvatar;
