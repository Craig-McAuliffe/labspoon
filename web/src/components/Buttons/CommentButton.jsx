import React, {useContext} from 'react';
import {AuthContext} from '../../App';
import {CommentIcon} from '../../assets/PostActionIcons';
import {SignUpPopoverOverride} from '../Popovers/Popover';

import './CommentButton.css';

export default function CommentButton({setIsCommenting, backgroundShade}) {
  const {user} = useContext(AuthContext);
  return (
    <SignUpPopoverOverride text="Sign up to comment." active={!!user}>
      <CommentButtonContent
        actionAndTriggerPopUp={() => {
          setIsCommenting((currentState) => !currentState);
        }}
        backgroundShade={backgroundShade}
      />
    </SignUpPopoverOverride>
  );
}

function CommentButtonContent({actionAndTriggerPopUp, backgroundShade}) {
  return (
    <div className="post-actions-button-container">
      <button
        className={`action-button-${
          backgroundShade ? backgroundShade : 'light'
        }-unselected
        }`}
        href="/"
        onClick={actionAndTriggerPopUp}
      >
        <CommentIcon />
        <span className="action-button-text">Comment</span>
      </button>
    </div>
  );
}
