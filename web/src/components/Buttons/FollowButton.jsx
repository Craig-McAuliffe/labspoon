import React, {useState} from 'react';

import './Buttons.css';

const FollowButton = ({currentState}) => {
  const [following, setFollowing] = useState(currentState);
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
