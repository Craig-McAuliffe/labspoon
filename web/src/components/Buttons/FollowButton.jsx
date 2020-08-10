import React, {useState} from 'react';
import './FollowButton.css';

const FollowButton = ({currentState}) => {
  const [buttonState, changeButtonState] = useState(currentState);
  return buttonState ? (
    <button className="UnfollowButton" onClick={() => changeButtonState(false)}>
      <div className="TextContainer">
        <h2>Unfollow</h2>
      </div>
    </button>
  ) : (
    <button className="FollowButton" onClick={() => changeButtonState(true)}>
      <div className="TextContainer">
        <h2>Follow</h2>
      </div>
    </button>
  );
};
export default FollowButton;
