import React from 'react';

import './Buttons.css';

export default function PrimaryButton({
  submit,
  onClick,
  small,
  children,
  formID,
  inactive,
  ...props
}) {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={
        small
          ? 'primary-button-small'
          : inactive
          ? 'primary-button-inactive'
          : 'primary-button'
      }
      onClick={onClick ? onClick : null}
      form={formID ? formID : null}
    >
      {small ? <h4>{children}</h4> : <h2>{children}</h2>}
    </button>
  );
}
