import React, {createContext, useState, useEffect} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import Routes from './routes.jsx';
import {auth, db} from './firebase';

import Header from './components/Layout/Header/Header';

import './App.css';

/**
 * Primary entry point into the app
 * @return {React.ReactElement}
 */
export default function App() {
  return (
    <FeatureFlagsProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes />
          </AppLayout>
        </Router>
      </AuthProvider>
    </FeatureFlagsProvider>
  );
}

const AppLayout = ({children}) => {
  return (
    <div className="layout">
      <div className="header-layout">
        <Header />
      </div>
      <div className="main-layout">{children}</div>
    </div>
  );
};

export const AuthContext = createContext(null);

function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  useEffect(
    () =>
      auth.onAuthStateChanged((user) => {
        setUser(user);
        if (user) localStorage.setItem('labspoon.expectSignIn', '1');
        else localStorage.removeItem('labspoon.expectSignIn');
      }),
    []
  );
  useEffect(() => {
    if (user === null || user === undefined) return setUserProfile(undefined);
    db.doc(`users/${user.uid}`)
      .get()
      .then((profile) => setUserProfile(profile.data()));
  }, [user]);
  return (
    <AuthContext.Provider value={{user, userProfile}}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Simple implementation of feature flags
 *
 * Feature flags are used to toggle features on and off. They allow us to turn
 * on features for development environments, without releasing those features
 * to production, and without maintaining multiple branches of the repo. See
 * https://en.wikipedia.org/wiki/Feature_toggle for details on their uses.
 *
 * If a feature flag is enabled, the corresponding feature is turned on, this
 * should be implemented by conditional statements.
 *
 * The enabled feature flags for the environment are space separated in ../.env
 * under the REACT_APP_ENABLED_FFLAGS field
 */
export const FeatureFlags = createContext([]);

function FeatureFlagsProvider({children}) {
  let fflags = new Set();
  if ('REACT_APP_ENABLED_FFLAGS' in process.env) {
    fflags = new Set(process.env.REACT_APP_ENABLED_FFLAGS.split(' '));
  } else {
    console.log('fflags not available');
  }
  return (
    <FeatureFlags.Provider value={fflags}>{children}</FeatureFlags.Provider>
  );
}
