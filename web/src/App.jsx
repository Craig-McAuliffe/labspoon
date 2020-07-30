import React, { useState, useEffect } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

import firebase from './firebase.js'

import FeedPage from './pages/Feed/Feed';

import './App.css';

function App() {
  const [user, setUser] = useState({});
  return (
    <AuthContext.Provider value={{user, setUser}}>
      <Router>
        <Switch>
          <AuthRoute user={user} exact path='/'>
            <FeedPage />
          </AuthRoute>
          <Route path="/login">
            <SignIn user={user} setUser={setUser}/>
          </Route>
        </Switch>
      </Router>
    </AuthContext.Provider>
  )
}

// Redirects to login screen if not authenticated
function AuthRoute({user, children, ...rest}) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        !!user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
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