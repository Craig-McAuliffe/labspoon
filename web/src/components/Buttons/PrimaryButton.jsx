import React from 'react';

import './Buttons.css';

export default function PrimaryButton({submit, onClick, children, ...props}) {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      className="primary-button"
      onClick={onClick ? onClick : null}
    >
      <h2>{children}</h2>
    </button>
  );
}
