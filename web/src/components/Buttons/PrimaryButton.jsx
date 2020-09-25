import React from 'react';

import './Buttons.css';

export default function PrimaryButton({
  submit,
  onClick,
  small,
  children,
  ...props
}) {
  return (
    <button
      type={submit ? 'submit' : 'button'}
      className={small ? 'primary-button-small' : 'primary-button'}
      onClick={onClick ? onClick : null}
    >
      {' '}
      {small ? <h4>{children}</h4> : <h2>{children}</h2>}
    </button>
  );
}
