import React from 'react';
import {PinIcon} from '../../assets/GeneralActionIcons';

import './PinButton.css';

export default function PinButton({onClick, isPinned}) {
  return (
    <button
      className={`resource-result-pin-button${isPinned ? '-pinned' : ''}`}
      onClick={onClick}
    >
      <PinIcon />
      {isPinned ? 'Unpin' : 'Pin'}
    </button>
  );
}
