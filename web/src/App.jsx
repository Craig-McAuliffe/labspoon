import React, {
  createContext,
  useState,
  useEffect,
  useReducer,
  useContext,
} from 'react';
import {BrowserRouter as Router, useLocation} from 'react-router-dom';
import Routes from './routes.jsx';
import {auth, db} from './firebase';
import Header from './components/Layout/Header/Header';
import {getDefaultAvatar, getDefaultCoverPhoto} from './helpers/users.js';

import './App.css';

/**
 * Primary entry point into the app
 * @return {React.ReactElement}
 */
export default function App() {
  return (
    <FeatureFlagsProvider>
      <AuthProvider>
        <BotProvider>
          <Router>
            <BotDetection>
              <AppLayout>
                <MicrosoftPublicationSearchCacheProvider>
                  <Routes />
                </MicrosoftPublicationSearchCacheProvider>
              </AppLayout>
            </BotDetection>
          </Router>
        </BotProvider>
      </AuthProvider>
    </FeatureFlagsProvider>
  );
}

export const BotDetector = createContext();
function BotProvider({children}) {
  const [rapidLocationChanges, setRapidLocationChanges] = useState(0);
  const [previousLocationTime, setPreviousLocationTime] = useState([]);
  const [botConfirmed, setBotConfirmed] = useState(false);
  if (botConfirmed) return <h2>Bot bot bot.</h2>;
  if (rapidLocationChanges > 20)
    return (
      <div>
        <h4>Recaptcha</h4>You are moving awfully fast. Are you a bot?{' '}
        <button
          onClick={() => setBotConfirmed(true)}
          className="not-a-human-button"
        >
          Yes I am a bot
        </button>{' '}
        <button
          onClick={() => setRapidLocationChanges(0)}
          className="not-a-bot-button"
        >
          No, I am not a bot
        </button>
        .
      </div>
    );
  return (
    <BotDetector.Provider
      value={{
        setRapidLocationChanges: setRapidLocationChanges,
        previousLocationTime: previousLocationTime,
        setPreviousLocationTime: setPreviousLocationTime,
        setBotConfirmed: setBotConfirmed,
      }}
    >
      {children}
    </BotDetector.Provider>
  );
}

function BotDetection({children}) {
  const {
    setRapidLocationChanges,
    previousLocationTime,
    setPreviousLocationTime,
  } = useContext(BotDetector);
  const locationPathName = useLocation().pathname;

  useEffect(() => {
    const timeAtLoad = new Date().getTime() / 1000;
    if (previousLocationTime && timeAtLoad - previousLocationTime < 1)
      setRapidLocationChanges((current) => current + 1);
    setPreviousLocationTime(timeAtLoad);
  }, [locationPathName]);
  return children;
}

const AppLayout = ({children}) => {
  const locationPathName = useLocation().pathname;
  if (locationPathName === '/about') return children;
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
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(
    () =>
      auth.onAuthStateChanged((user) => {
        setUser(user);
        setAuthLoaded(true);
        if (user) localStorage.setItem('labspoon.expectSignIn', '1');
        else localStorage.removeItem('labspoon.expectSignIn');
      }),
    []
  );

  // Refetch the user details. This is usually triggered by a change in the
  // firebase auth, but this does not work during sign up.
  function updateUserDetails(user) {
    if (user === null || user === undefined) return setUserProfile(undefined);
    db.doc(`users/${user.uid}`)
      .get()
      .then((profile) => {
        if (!profile.exists) {
          setUserProfile(undefined);
          return;
        }
        const userData = profile.data();
        if (userData && !userData.avatar) userData.avatar = getDefaultAvatar();
        if (userData && !userData.coverPhoto)
          userData.coverPhoto = getDefaultCoverPhoto();
        setUserProfile(userData);
      })
      .catch((err) => console.log(err, 'could not retrieve user profile'));
  }

  useEffect(() => {
    updateUserDetails(user);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{user, userProfile, authLoaded, updateUserDetails}}
    >
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

export const MicrosoftPublicationSearchCache = createContext({});

function MicrosoftPublicationSearchCacheProvider({children}) {
  function reducer(state, action) {
    state.set(action.args, action.results);
    return state;
  }

  const [interpretCache, interpretDispatch] = useReducer(reducer, new Map());

  return (
    <MicrosoftPublicationSearchCache.Provider
      value={{interpretCache, interpretDispatch}}
    >
      {children}
    </MicrosoftPublicationSearchCache.Provider>
  );
}
