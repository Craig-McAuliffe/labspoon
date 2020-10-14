import React from 'react';

import './SuccessMessage.css';

export default function SuccessMessage({children}) {
  return (
    <div className="onboarding-success-overlay-container">
      <div className="success-overlay">
        <h3>{children}</h3>
      </div>
    </div>
  );
}
