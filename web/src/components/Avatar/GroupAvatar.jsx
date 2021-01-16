import React from 'react';
import Image from 'react-bootstrap/Image';
import {getDefaultAvatar} from '../../helpers/groups.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Avatar.css';

const GroupAvatar = ({src, width, height}) => {
  return (
    <Image
      className="avatar"
      src={src ? src : getDefaultAvatar()}
      roundedCircle
      width={width}
      height={height}
      onError={(img) => (img.target.src = getDefaultAvatar())}
    />
  );
};

export default GroupAvatar;
