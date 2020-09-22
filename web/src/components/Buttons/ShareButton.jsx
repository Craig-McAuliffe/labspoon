import React, {useState} from 'react';
import {
  ShareIconUnselected,
  ShareIconSelected,
} from '../../assets/PostActionIcons';

const ShareButton = ({currentState}) => {
  const [shared, setShared] = useState(currentState);
  return (
    <div className="button-container">
      <button
        className="action-button"
        href="/"
        onClick={() => setShared(!shared)}
      >
        {shared ? <ShareIconSelected /> : <ShareIconUnselected />}
        <span className="action-button-text">Share</span>
      </button>
    </div>
  );
};

export default ShareButton;
