import React, { useState, useEffect } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from './firebase.js'
import logo from './labspoon_logo_banner.svg';
import './App.css';

function App() {
  const [user, setUser] = useState({});
  return (
    <AuthContext.Provider value={{user, setUser}}>
      <SignIn user={user} setUser={setUser}/>
    </AuthContext.Provider>
  )
}

function SignIn({user, setUser}) {
  let UIConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    },
  }
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(
      (user) => setUser(user)
    );
    return unregisterAuthObserver;
  });
  if (!user) {
    return (
      <div>
        <p>not signed in</p>
        <StyledFirebaseAuth uiConfig={UIConfig} firebaseAuth={firebase.auth()}/>
      </div>
    );
  } else {
    return (
      <div>
        <p>signed in</p>
        <a onClick={() => {
          console.log('clicked sign out')
          firebase.auth().signOut();
        }}>Sign out</a>
      </div>
    )
  }
};

const AuthContext = React.createContext();

export default App;