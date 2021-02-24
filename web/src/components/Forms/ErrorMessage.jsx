import React from 'react';

import './ErrorMessage.css';

export default function ErrorMessage({noBorder, children}) {
  return (
    <div className="onboarding-error-overlay-container">
      <div className={`error-overlay${noBorder ? '-no-border' : ''}`}>
        <h3>{children}</h3>
      </div>
    </div>
  );
}
