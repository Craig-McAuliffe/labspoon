import React, {useState, useEffect} from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import firebase from './firebase.js';

import FeedPage from './pages/Feed/Feed';

import './App.css';

/**
 * Primary entry point into the app
 * @return {React.ReactElement}
 */
export default function App() {
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
  );
}

/**
 * Route wrapper that redirects to the login screen if the user is not
 * authenticated
 * @return {Route}
 */
function AuthRoute({user, children, ...rest}) {
  return (
    <Route
      {...rest}
      render={({location}) =>
        !!user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {from: location},
            }}
          />
        )
      }
    />
  );
}
AuthRoute.propTypes = {
  user: PropTypes.any.isRequired,
  children: PropTypes.element,
};

/**
 * Sign in page using the Firebase authentication handler
 * @param {Function} setUser - function that updates the auth context upon a
 * sign in event
 * @return {React.ReactElement}
 */
function SignIn({user, setUser}) {
  const UIConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(
        (user) => setUser(user),
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
          firebase.auth().signOut();
        }}>Sign out</a>
      </div>
    );
  }
};
SignIn.propTypes = {
  user: PropTypes.any.isRequired,
  setUser: PropTypes.func.isRequired,
};

const AuthContext = React.createContext();
