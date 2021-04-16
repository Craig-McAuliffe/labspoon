import React from 'react';
import Image from 'react-bootstrap/Image';
import {getDefaultAvatar} from '../../helpers/users.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Avatar.css';

const UserAvatar = ({src, width, height, loading}) => {
  return (
    <Image
      className={`avatar${loading ? '-loading' : ''}`}
      src={src ? src : getDefaultAvatar()}
      roundedCircle
      width={width}
      height={height}
    />
  );
};

export default UserAvatar;
