import React, {useState} from 'react';
import {
  ToGroupIconUnselected,
  ToGroupIconSelected,
} from '../../assets/PostActionIcons';

const RepostToGroupButton = ({currentState}) => {
  const [reposted, setReposted] = useState(currentState);
  return (
    <div className="button-container">
      <button
        className="action-button"
        href="/"
        onClick={() => setReposted(!reposted)}
      >
        {reposted ? <ToGroupIconSelected /> : <ToGroupIconUnselected />}
        <span className="action-button-text">Re-post to group</span>
      </button>
    </div>
  );
};

export default RepostToGroupButton;
