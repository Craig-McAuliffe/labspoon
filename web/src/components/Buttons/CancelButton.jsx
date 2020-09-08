import React from 'react';

import './Buttons.css';

export default function CancelButton({CancelAction}) {
  return (
    <button className="cancel-button">
      <h2 className="primary-button-text">Cancel</h2>
    </button>
  );
}
