import React, {useContext} from 'react';
import firebase from '../../firebase.js';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {Redirect} from 'react-router';
import {AuthContext} from '../../App';

/**
 * Sign in page using the Firebase authentication handler
 * @param {Function} setUser - function that updates the auth context upon a
 * sign in event
 * @return {React.ReactElement}
 */
function LoginPage() {
  const user = useContext(AuthContext);
  const UIConfig = {
    signInFlow: 'popup',
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };
  if (!user) {
    return (
      <div className="content-layout">
        <div className="page-content-container">
          <StyledFirebaseAuth
            uiConfig={UIConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      </div>
    );
  } else {
    return <Redirect to="/" />;
  }
}

export default LoginPage;
