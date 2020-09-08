import React, {useState} from 'react';

import './Buttons.css';

export default function SaveButton({currentState, submit}) {
  const [saved, setSaved] = useState(currentState);
  return (
    <div className="save-button-container">
      <button
        type="submit"
        className={saved ? 'primary-button-clicked' : 'primary-button'}
        onClick={() => {
          if (submit !== undefined) submit();
          setSaved(true);
        }}
      >
        <div className="primary-button-text">
          <h2>{saved ? 'Saved' : 'Save'}</h2>
        </div>
      </button>
    </div>
  );
}
