import React from 'react';

import {EditIcon} from '../../assets/GeneralActionIcons';

import './Buttons.css';

export default function EditButton({backgroundShade, editAction, children}) {
  return (
    <button
      className={`edit-button-${backgroundShade ? backgroundShade : 'light'}`}
      type="button"
      onClick={editAction ? () => editAction() : () => {}}
    >
      <EditIcon />
      <h3>{children}</h3>
    </button>
  );
}
