import React from 'react';

import './Buttons.css';

export default function CancelButton({cancelAction, isDisabled}) {
  return (
    <button
      className={`cancel-button${isDisabled ? '-inactive' : ''}`}
      type="button"
      onClick={() => cancelAction()}
      disabled={isDisabled}
    >
      <h3>Cancel</h3>
    </button>
  );
}
