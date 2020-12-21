import React from 'react';
import {Link} from 'react-router-dom';
import GroupAvatar from '../Avatar/GroupAvatar';

import './GroupSignature.css';
export default function GroupSignature({group}) {
  if (!group) return null;
  return (
    <div className="group-signature-container">
      <Link to={`/group/${group.id}`} className="group-signature-link">
        <GroupAvatar src={group.avatar} height="70px" width="70px" />
        <div className="group-signature-text-container">
          <h4 className="group-signature-name">{group.name}</h4>
          <h4 className="group-signature-institution">{group.institution}</h4>
        </div>
      </Link>
    </div>
  );
}