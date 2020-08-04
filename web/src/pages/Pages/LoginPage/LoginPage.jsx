import React, {useEffect} from 'react';
import firebase from '../../firebase.js';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

function LoginPage({user, setUser}) {
  let UIConfig = {
    signInFlow: 'popup',
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };
  useEffect(() => {
    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged((user) => setUser(user));
    return unregisterAuthObserver;
  });
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
            console.log('clicked sign out');
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
