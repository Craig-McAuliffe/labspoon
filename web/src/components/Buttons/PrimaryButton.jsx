import React from 'react';

import './PrimaryButton.css';

export default function PrimaryButton({
  submit,
  onClick,
  smallVersion,
  children,
  formID,
  disabled,
  light,
  ...props
}) {
  let className = 'primary-button';
  if (smallVersion) className = className + '-smallVersion';

  if (light) className = className + '-light';

  if (disabled) className = className + '-inactive';

  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={className}
      onClick={() => {
        if (disabled || !onClick) return;
        onClick();
      }}
      form={formID ? formID : null}
      disabled={disabled ? true : false}
      {...props}
    >
      {smallVersion ? (
        <h4 className="primary-button-text-smallVersion">{children}</h4>
      ) : (
        <h2 className="primary-button-text">{children}</h2>
      )}
    </button>
  );
}
