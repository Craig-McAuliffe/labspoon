import React from 'react';

import './Buttons.css';

export default function PrimaryButton({
  submit,
  onClick,
  small,
  children,
  formID,
  disabled,
  ...props
}) {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={
        small
          ? 'primary-button-small'
          : disabled
          ? 'primary-button-inactive'
          : 'primary-button'
      }
      onClick={onClick ? onClick : null}
      form={formID ? formID : null}
      disabled={disabled}
    >
      {small ? (
        <h4 className="primary-button-text-small">{children}</h4>
      ) : (
        <h2 className="primary-button-text">{children}</h2>
      )}
    </button>
  );
}
