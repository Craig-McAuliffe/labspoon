import React from 'react';
import './FollowButton.css';

const FollowButton = ({changeButtonState}) => (
  <button className="FollowButton" onClick={() => changeButtonState(true)}>
    <div className="TextContainer">
      <h2>Follow</h2>
    </div>
  </button>
);

export const UnfollowButton = ({changeButtonState}) => (
  <button className="UnfollowButton" onClick={() => changeButtonState(false)}>
    <div className="TextContainer">
      <h2>Unfollow</h2>
    </div>
  </button>
);

export const FollowButtonLarge = () => (
  <button className="FollowButton">
    <div className="TextContainer">
      <h2>Follow</h2>
    </div>
  </button>
);

export default FollowButton;
