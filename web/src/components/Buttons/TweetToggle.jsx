import React from 'react';
import twitterIconBlue from '../../assets/Twitter-logo-blue.png';
import './TweetToggle.css';

export default function TweetToggle({checked, setChecked}) {
  return (
    <div className="tweet-toggle-container">
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
