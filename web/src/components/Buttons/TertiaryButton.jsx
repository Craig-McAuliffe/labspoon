import React from 'react';

import './TertiaryButton.css';

export default function TertiaryButton({onClick, children}) {
  return (
    <button className="tertiary-button" onClick={onClick} type={'button'}>
      {children}
    </button>
  );
}
