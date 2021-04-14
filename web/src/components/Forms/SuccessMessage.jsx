import React from 'react';

import './SuccessMessage.css';

export default function SuccessMessage({isOverlay, children}) {
  if (isOverlay)
    return (
      <div className="success-container-overlay">
        <div className="success-overlay-positioning">
          <h3>{children}</h3>
        </div>
      </div>
    );
  return (
    <div className="success-container">
      <div className="success-overlay">
        <h3>{children}</h3>
      </div>
    </div>
  );
}
