import React from 'react';

import './PrimaryButton.css';

export default function NegativeButton({
  onClick,
  children,
  smallVersion,
  ...props
}) {
  return (
    <button
      type="button"
      className={
        smallVersion ? 'negative-button-smallVersion' : 'negative-button'
      }
      onClick={onClick ? onClick : null}
    >
      {smallVersion ? (
        <h4 className="primary-button-text-smallVersion">{children}</h4>
      ) : (
        <h2 className="primary-button-text">{children}</h2>
      )}
    </button>
  );
}
