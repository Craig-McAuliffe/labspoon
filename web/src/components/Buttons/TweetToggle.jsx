import React from 'react';
import twitterIconBlue from '../../assets/Twitter-logo-blue.png';
import OnHoverPopover from '../Popovers/OnHoverPopover';
import './TweetToggle.css';

export default function TweetToggle({checked, setChecked}) {
  return (
    <OnHoverPopover
      popoverText="  Redirects to your Twitter with the post pre-populated. Does not auto
    tweet."
      minWidth="140px"
      width="40vw"
    >
      <TwitterToggleDisplay checked={checked} setChecked={setChecked} />
    </OnHoverPopover>
  );
}

function TwitterToggleDisplay({checked, setChecked, setIsHovering}) {
  return (
    <div
      className="tweet-toggle-container"
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img
        src={twitterIconBlue}
        alt="Twitter logo"
        className="twitter-toggle-logo"
      />
      <label className="twitter-toggle-switch">
        <input type="checkbox" onChange={() => setChecked(!checked)} />
        <span className="twitter-toggle-slider-round"></span>
      </label>
    </div>
  );
}
