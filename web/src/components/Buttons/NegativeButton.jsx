import React from 'react';

import './PrimaryButton.css';

export default function NegativeButton({onClick, children, small, ...props}) {
  return (
    <button
      type="button"
      className={small ? 'negative-button-small' : 'negative-button'}
      onClick={onClick ? onClick : null}
    >
      {small ? (
        <h4 className="primary-button-text">{children}</h4>
      ) : (
        <h2 className="primary-button-text-small">{children}</h2>
      )}
    </button>
  );
}
