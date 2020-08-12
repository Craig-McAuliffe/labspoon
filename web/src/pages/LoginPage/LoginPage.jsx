import React, {useEffect, useContext} from 'react';
import firebase from '../../firebase.js';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import {AuthContext} from '../../App';

/**
 * Sign in page using the Firebase authentication handler
 * @param {Function} setUser - function that updates the auth context upon a
 * sign in event
 * @return {React.ReactElement}
 */
function LoginPage() {
  const user = useContext(AuthContext);
  let UIConfig = {
    signInFlow: 'popup',
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };
  if (!user) {
    return (
      <div>
        <p>not signed in</p>
        <StyledFirebaseAuth
          uiConfig={UIConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );
  } else {
    return (
      <div>
        <p>signed in</p>
        <a
          onClick={() => {
            firebase.auth().signOut();
          }}
        >
          Sign out
        </a>
      </div>
    );
  }
}

export default LoginPage;
