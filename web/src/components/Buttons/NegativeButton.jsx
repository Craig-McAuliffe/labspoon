import React from 'react';

import './PrimaryButton.css';

export default function NegativeButton({
  onClick,
  children,
  smallVersion,
  disabled,
  ...props
}) {
  let className = 'negative-button';
  if (smallVersion) className = className + '-smallVersion';

  if (disabled) className = className + '-disabled';
  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
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
