import React from 'react';
import {Link} from 'react-router-dom';

import './ReturnToPublicViewButton.css';

export default function ReturnToPublicViewButton({url}) {
  return (
    <div className="edit-group-posts-cancel">
      <Link to={url}>
        <button className="edit-group-page-back">
          <h4>Back to Public View</h4>
        </button>
      </Link>
    </div>
  );
}
