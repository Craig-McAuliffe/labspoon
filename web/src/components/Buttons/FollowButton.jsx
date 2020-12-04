import React, {useState, useContext, useRef, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {AuthContext} from '../../App';
import './Buttons.css';
import './FollowButton.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const FollowButton = ({following, setFollowing}) => {
  const [signUpPrompt, setSignUpPrompt] = useState(false);
  const {user} = useContext(AuthContext);
  const locationPathName = useLocation().pathname;
  const signUpPromptRef = useRef();

  const followAction = () => {
    user ? setFollowing() : setSignUpPrompt(true);
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
    <div className="button-position">
      <button
        className={
          following == null
            ? 'primary-button-spinner'
            : following
            ? 'primary-button-clicked'
            : 'primary-button'
        }
        onClick={followAction}
      >
        <div className="primary-button-text">
          {following != null ? (
            <h2>{following ? 'Unfollow' : 'Follow'}</h2>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </button>
      {signUpPrompt ? (
        <div className="sign-up-prompt" ref={signUpPromptRef}>
          <Link
            to={{
              pathname: '/login',
              state: {returnLocation: locationPathName},
            }}
          >
            Sign up to follow this.
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default FollowButton;
