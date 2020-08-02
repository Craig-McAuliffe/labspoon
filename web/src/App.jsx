import React, {useState} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
// import {Layout} from 'antd';
import Routes from './routes.jsx';

import LabspoonHeader from './components/Layout/Header/Header';
import LabspoonSider from './components/Layout/Sider/Sider';

import './App.css';

// const {Header, Content, Sider, Footer} = Layout;

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
        <LabspoonHeader />
      </div>
      <div className="Main">
        <div className="Sider">
          <LabspoonSider />
        </div>
        <div className="Content">{children}</div>
      </div>
    </div>
  );
  // <Layout className="Layout" style={{backgroundColor: 'transparent'}}>
  //   <Header
  //     className="Header"
  //     style={{
  //       backgroundColor: 'transparent',
  //     }}
  //   >
  //     <LabspoonHeader />
  //   </Header>
  //   <Layout className="Main">
  //     <Sider className="Sider" style={{backgroundColor: 'transparent'}}>
  //       <LabspoonSider />
  //     </Sider>
  //     <Content className="Content">{children}</Content>
  //   </Layout>
  //   <Footer>This is a footer</Footer>
  // </Layout>
};

export const AuthContext = React.createContext();

export default App;
