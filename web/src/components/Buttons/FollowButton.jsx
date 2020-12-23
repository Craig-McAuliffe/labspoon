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

  const buttonContent = (
    <FollowButtonContent followAction={followAction} following={following} />
  );

  if (user) return buttonContent;

  return (
    <SignUpPopoverOverride
      text="Sign up to follow this."
      actionTaken={FOLLOW}
      active={!!user}
    >
      {buttonContent}
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
        {following === undefined ? (
          <LoadingSpinner />
        ) : (
          <h2 className="primary-button-text">
            {following ? 'Unfollow' : 'Follow'}
          </h2>
        )}
      </button>
    </div>
  );
}

export default FollowButton;
