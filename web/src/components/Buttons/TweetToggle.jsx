import React, {useState, useEffect} from 'react';
import twitterIconBlue from '../../assets/Twitter-logo-blue.png';
import './TweetToggle.css';

export default function TweetToggle({checked, setChecked}) {
  const [isInfoDisplayed, setIsInfoDisplayed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isHovering) {
      if (isInfoDisplayed) setIsInfoDisplayed(false);
      return;
    }
    const infoAfterTimeout = setTimeout(() => setIsInfoDisplayed(true), 800);
    return () => clearTimeout(infoAfterTimeout);
  }, [isHovering]);

  return (
    <div
      className="tweet-toggle-container"
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={`tweet-toggle-info${
          isInfoDisplayed ? '-visible' : '-hidden'
        }`}
      >
        Redirects to your Twitter with the post pre-populated. Does not auto
        tweet.
      </div>
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
