import React from 'react';

import './Buttons.css';

const FollowButton = ({following, setFollowing}) => {
  return (
    <button
      className={following ? 'primary-button-clicked' : 'primary-button'}
      onClick={() => setFollowing(!following)}
    >
      <div className="primary-button-text">
        <h2>{following ? 'Unfollow' : 'Follow'}</h2>
      </div>
    </button>
  );
};
export default FollowButton;
