import React, {useState} from 'react';
import {
  ShareIconUnselected,
  ShareIconSelected,
} from '../../assets/PostActionIcons';

const ShareButton = ({currentState}) => {
  const [buttonState, changeButtonState] = useState(currentState);
  return buttonState ? (
    <div className="button-container">
      <ShareIconSelected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(false)}
      >
        Share
      </button>
    </div>
  ) : (
    <div className="button-container">
      <ShareIconUnselected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(true)}
      >
        Share
      </button>
    </div>
  );
};

export default ShareButton;
