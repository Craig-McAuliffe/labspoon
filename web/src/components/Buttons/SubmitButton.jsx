import React from 'react';

import './Buttons.css';

export default function SubmitButton({inputText, ...props}) {
  return (
    <button type="submit" className="primary-button">
      <div className="primary-button-text">
        <h2>{inputText}</h2>
      </div>
    </button>
  );
}
