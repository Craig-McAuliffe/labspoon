import React from 'react';
import Image from 'react-bootstrap/Image';
import {getDefaultAvatar} from '../../helpers/users.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Avatar.css';

const UserAvatar = ({src, width, height}) => {
  return (
    <Image
      className="avatar"
      src={src ? src : getDefaultAvatar()}
      roundedCircle
      width={width}
      height={height}
    />
  );
};

export default UserAvatar;
