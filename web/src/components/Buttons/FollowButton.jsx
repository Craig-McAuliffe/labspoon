import React, {useState, useContext, useRef, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import './Buttons.css';

const FollowButton = ({following, setFollowing}) => {
  const [signUpPrompt, setSignUpPrompt] = useState(false);
  const {user} = useContext(AuthContext);
  const signUpPromptRef = useRef();

  const followAction = () => {
    user ? setFollowing(!following) : setSignUpPrompt(true);
  };

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (signUpPromptRef.current) {
        if (
          !signUpPromptRef.current.contains(e.target) &&
          signUpPrompt === true
        )
          setSignUpPrompt(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  return (
    <div className="follow-button-position">
      <button
        className={following ? 'primary-button-clicked' : 'primary-button'}
        onClick={followAction}
      >
        <div className="primary-button-text">
          <h2>{following ? 'Unfollow' : 'Follow'}</h2>
        </div>
      </button>
      {signUpPrompt ? (
        <div className="sign-up-prompt" ref={signUpPromptRef}>
          <Link to="/login">Sign up to follow this.</Link>
        </div>
      ) : null}
    </div>
  );
};

export default FollowButton;
