import React from 'react';

import {EditIcon} from '../../assets/GeneralActionIcons';

import './Buttons.css';

export default function EditButton({editAction, children}) {
  return (
    <div className="edit-button-container">
      <EditIcon />
      <button
        className="edit-button"
        type="button"
        onClick={editAction ? () => editAction() : () => {}}
      >
        <h3>{children}</h3>
      </button>
    </div>
  );
}
