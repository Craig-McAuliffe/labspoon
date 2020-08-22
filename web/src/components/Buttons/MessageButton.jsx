import React from 'react';
import {MessageIcon} from '../../assets/ResourceIcons';

import './MessageButton.css';

export default function MessageButton() {
  return (
    <button className="message-button">
      <MessageIcon />
      <p>Message</p>
    </button>
  );
}
