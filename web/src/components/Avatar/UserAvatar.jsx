import React from 'react';
import Image from 'react-bootstrap/Image';
import {getDefaultAvatar, getDefaultCoverPhoto} from '../../helpers/users.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Avatar.css';

export function CoverPhoto({src}) {
  return (
    <Image
      className="user-cover-photo"
      alt="user cover"
      src={src}
      onError={(img) => (img.target.src = getDefaultCoverPhoto())}
    />
  );
}

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
