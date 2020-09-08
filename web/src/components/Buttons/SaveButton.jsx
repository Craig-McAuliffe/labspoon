import React from 'react';

import './Buttons.css';

export default function SaveButton({...props}) {
  return (
    <div className="save-button-container">
      <button type="submit" className="primary-button">
        <div className="primary-button-text">
          <h2>Save</h2>
        </div>
      </button>
    </div>
  );
}
