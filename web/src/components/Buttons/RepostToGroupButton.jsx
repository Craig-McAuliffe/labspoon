import React, {useState} from 'react';
import {
  ToGroupIconUnselected,
  ToGroupIconSelected,
} from '../../assets/PostActionIcons';

const RepostToGroupButton = ({currentState}) => {
  const [reposted, setReposted] = useState(currentState);
  return (
    <div className="button-container">
      {reposted ? <ToGroupIconSelected /> : <ToGroupIconUnselected />}
      <button
        className="action-button"
        href="/"
        onClick={() => setReposted(!reposted)}
      >
        Repost to group
      </button>
    </div>
  );
};

export default RepostToGroupButton;
