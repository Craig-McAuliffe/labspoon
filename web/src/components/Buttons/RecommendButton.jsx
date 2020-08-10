import React, {useState} from 'react';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';

const RecommendButton = ({currentState}) => {
  const [buttonState, changeButtonState] = useState(currentState);
  return buttonState ? (
    <div className="button-container">
      <RecommendIconSelected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(false)}
      >
        Recommend
      </button>
    </div>
  ) : (
    <div className="button-container">
      <RecommendIconUnselected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(true)}
      >
        Recommend
      </button>
    </div>
  );
};

export default RecommendButton;
