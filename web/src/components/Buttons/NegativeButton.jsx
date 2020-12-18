import React from 'react';

import './Buttons.css';

export default function NegativeButton({onClick, children, small, ...props}) {
  return (
    <button
      type="button"
      className={small ? 'negative-button-small' : 'negative-button'}
      onClick={onClick ? onClick : null}
    >
      {small ? <h4>{children}</h4> : <h2>{children}</h2>}
    </button>
  );
}
