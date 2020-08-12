import React, {createContext, useState, useEffect} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import Routes from './routes.jsx';
import {auth} from './firebase';

import Header from './components/Layout/Header/Header';

import './App.css';

/**
 * Primary entry point into the app
 * @return {React.ReactElement}
 */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes />
        </AppLayout>
      </Router>
    </AuthProvider>
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
  const [user, setUser] = useState({});
  useEffect(() => auth.onAuthStateChanged((user) => setUser(user)));
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
