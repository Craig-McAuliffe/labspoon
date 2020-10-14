import React from 'react';

import './Buttons.css';
export default function SecondaryButton({onClick, buttonText, inactive}) {
  return (
    <button
      className={
        inactive ? 'secondary-button-inactive' : 'secondary-button-active'
      }
      onClick={onClick}
    >
      <h3>{buttonText}</h3>
    </button>
  );
}
