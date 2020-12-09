import React from 'react';

import './ErrorMessage.css';

export default function ErrorMessage({children}) {
  return (
    <div className="onboarding-error-overlay-container">
      <div className="error-overlay">
        <h3>{children}</h3>
      </div>
    </div>
  );
}
