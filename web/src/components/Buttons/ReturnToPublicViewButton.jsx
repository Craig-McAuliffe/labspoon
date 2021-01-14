import React from 'react';
import {Link} from 'react-router-dom';

import './ReturnToPublicViewButton.css';

export default function ReturnToPublicViewButton({url}) {
  return (
    <Link to={url} className="return-to-public-view-button">
      <h4>Back to Public View</h4>
    </Link>
  );
}
