import React, {useState} from 'react';
import {
  ShareIconUnselected,
  ShareIconSelected,
} from '../../assets/PostActionIcons';

const ShareButton = ({currentState}) => {
  const [shared, setShared] = useState(currentState);
  return (
    <div className="button-container">
      {shared ? <ShareIconSelected /> : <ShareIconUnselected />}
      <button
        className="action-button"
        href="/"
        onClick={() => setShared(!shared)}
      >
        Share
      </button>
    </div>
  );
};

export default ShareButton;
