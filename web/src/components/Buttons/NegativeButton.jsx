import React from 'react';

import './Buttons.css';

export default function PrimaryButton({onClick, children, ...props}) {
  return (
    <button
      type="button"
      className="negative-button"
      onClick={onClick ? onClick : null}
    >
      <h2>{children}</h2>
    </button>
  );
}
