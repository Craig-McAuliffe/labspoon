import React, {useContext} from 'react';
import {AuthContext} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {FOLLOW, SignUpPopoverOverride} from '../Popovers/Popover';
import './Buttons.css';
import './FollowButton.css';

const FollowButton = ({following, setFollowing}) => {
  const {user} = useContext(AuthContext);
  const followAction = () => {
    if (!user) return;
    setFollowing();
  };

  return (
    <SignUpPopoverOverride text="Sign up to follow this." actionTaken={FOLLOW}>
      <FollowButtonContent followAction={followAction} following={following} />
    </SignUpPopoverOverride>
  );
};

function FollowButtonContent({followAction, following}) {
  return (
    <div className="button-position">
      <button
        className={
          following == null
            ? 'primary-button-spinner'
            : following
            ? 'primary-button-clicked'
            : 'primary-button'
        }
        onClick={followAction}
      >
        <div className="primary-button-text">
          {following === undefined ? (
            <LoadingSpinner />
          ) : (
            <h2>{following ? 'Unfollow' : 'Follow'}</h2>
          )}
        </div>
      </button>
    </div>
  );
}

export default FollowButton;
