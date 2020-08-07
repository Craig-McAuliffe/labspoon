import React, {useState} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import Routes from './routes.jsx';

import Header from './components/Layout/Header/Header';

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
        <AppLayout>
          <Routes />
        </AppLayout>
      </Router>
    </AuthContext.Provider>
  );
}

const AppLayout = ({children}) => {
  return (
    <div className="Layout">
      <div className="Header">
        <Header />
      </div>
      <div className="Main">{children}</div>
    </div>
  );
};

export const AuthContext = React.createContext();
