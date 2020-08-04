import React, {useState} from 'react';

import FollowButton, {UnfollowButton} from '../Buttons/FollowButton';

const SwitchButtonState = ({type}) => {
  if (type === 'follow') return <SwitchFollowButton />;
  else return;
};

const SwitchFollowButton = () => {
  const [buttonState, changeButtonState] = useState(false);
  return buttonState ? (
    <UnfollowButton changeButtonState={changeButtonState} />
  ) : (
    <FollowButton changeButtonState={changeButtonState} />
  );
};

export default SwitchButtonState;
