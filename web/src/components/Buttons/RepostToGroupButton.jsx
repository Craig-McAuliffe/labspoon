import React, {useState} from 'react';
import {
  ToGroupIconUnselected,
  ToGroupIconSelected,
} from '../../assets/PostActionIcons';

const RepostToGroupButton = ({currentState}) => {
  const [buttonState, changeButtonState] = useState(currentState);
  return buttonState ? (
    <div className="button-container">
      <ToGroupIconSelected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(false)}
      >
        Repost to group
      </button>
    </div>
  ) : (
    <div className="button-container">
      <ToGroupIconUnselected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(true)}
      >
        Repost to group
      </button>
    </div>
  );
};

export default RepostToGroupButton;
