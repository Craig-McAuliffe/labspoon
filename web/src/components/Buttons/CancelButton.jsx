import React from 'react';

import './Buttons.css';

export default function CancelButton({cancelAction}) {
  return (
    <button
      className="cancel-button"
      type="button"
      onClick={() => cancelAction()}
    >
      <h3 className="primary-button-text">Cancel</h3>
    </button>
  );
}
