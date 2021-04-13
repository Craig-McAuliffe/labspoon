import React from 'react';

import {EditIcon} from '../../assets/GeneralActionIcons';

import './Buttons.css';

export default function EditButton({editAction, children}) {
  return (
    <button
      className="edit-button"
      type="button"
      onClick={editAction ? () => editAction() : () => {}}
    >
      <EditIcon />
      <h3>{children}</h3>
    </button>
  );
}
