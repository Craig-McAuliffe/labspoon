import React, {useState} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import Routes from './routes.jsx';

import Header from './components/Layout/Header/Header';
import Sider from './components/Layout/Sider/Sider';

import './App.css';

function App() {
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
      <div className="Main">
        <div className="Sider">
          <Sider />
        </div>
        <div className="Content">{children}</div>
        <div className="right-sider">Adverts and such</div>
      </div>
    </div>
  );
};

export const AuthContext = React.createContext();

export default App;
