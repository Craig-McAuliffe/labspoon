import React from 'react';
import './FollowButton.css';

const FollowButton = ({following, setFollowing}) => {
  return (
    <button
      className={following ? 'UnfollowButton' : 'FollowButton'}
      onClick={() => setFollowing(false)}
    >
      <div className="TextContainer">
        <h2>{following ? 'Unfollow' : 'Follow'}</h2>
      </div>
    </button>
  );
};
export default FollowButton;
