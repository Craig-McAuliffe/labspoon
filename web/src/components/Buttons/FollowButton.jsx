import React, {useContext} from 'react';
import {AuthContext} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {FOLLOW, SignUpPopoverOverride} from '../Popovers/Popover';
import './Buttons.css';
import './FollowButton.css';

const FollowButton = ({
  backgroundShade,
  following,
  setFollowing,
  actionAndTriggerPopUp,
}) => {
  const {user} = useContext(AuthContext);
  const followAction = () => {
    if (actionAndTriggerPopUp) actionAndTriggerPopUp();
    if (!user) return;
    setFollowing();
  };

  const buttonContent = (
    <FollowButtonContent
      actionAndTriggerPopUp={followAction}
      following={following}
      backgroundShade={backgroundShade}
    />
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

function FollowButtonContent({
  backgroundShade,
  actionAndTriggerPopUp,
  following,
}) {
  let className =
    'primary-button-' + (backgroundShade ? backgroundShade : 'light');
  if (following == null) className = `${className}-spinner`;
  if (following) className = `${className}-clicked`;
  return (
    <button className={className} onClick={actionAndTriggerPopUp}>
      {following === undefined ? (
        <LoadingSpinner />
      ) : (
        <h2>{following ? 'Unfollow' : 'Follow'}</h2>
      )}
    </button>
  );
}

export default FollowButton;
