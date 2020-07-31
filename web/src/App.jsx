import React, { useState, useEffect } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import { Layout } from 'antd';
import firebase from './firebase.js'
// import logo from './labspoon_logo_banner.svg';

import AccountPage from './Pages/AccountPage'
import BookmarksPage from './Pages/BookmarksPage'
import FollowingPage from './Pages/FollowingPage'
import GraphPage from './Pages/GraphPage'
import GroupPage from './Pages/GroupPage'
import ManageFollowsPage from './Pages/ManageFollowsPage'
import SearchPage from './Pages/SearchPage'
import UserProfilePage from './Pages/UserProfilePage'

import './App.css';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [user, setUser] = useState({});
  return (
    <AuthContext.Provider value={{user, setUser}}>
    <AppLayout>
      <Router>
        <Switch>
          <Route exact path='/'>
            <FollowingPage />
          </Route>
          <Route path="/login">
            <SignIn user={user} setUser={setUser}/>
          </Route>
          <AuthRoute user={user} path='/account'>
            <AccountPage/> 
          </AuthRoute>
          <AuthRoute user={user} path='/bookmarks'>
            <BookmarksPage/> 
          </AuthRoute>
          <Route path='/graph'>
            <GraphPage/> 
          </Route>
          <Route path='/group'>
            <GroupPage/> 
          </Route>
          <AuthRoute user={user} path='/managefollows'>
            <ManageFollowsPage/> 
          </AuthRoute>
          <Route path='/search'>
            <SearchPage/> 
          </Route>
          <AuthRoute user={user} path='/userprofile'>
            <UserProfilePage/> 
          </AuthRoute>
        </Switch>
      </Router>
      </AppLayout>
    </AuthContext.Provider>
  )
}


const AppLayout = ({ children }) => {
  return (
    <Layout
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        minHeight: '100vh',
      }}
    >
      <Header style={{ width: '100%', zIndex: 1 }}>
        {/* <LabspoonHeader /> */}
      </Header>
      <Layout>
        <Sider width={250} trigger={null} className="Sider">
          {/* <LabspoonSider /> */}
        </Sider>
        <Content>{children}</Content>
      </Layout>

      <Footer style={{ backgroundColor: '#020079' }}>
        {/* <LabspoonFooter /> */}
      </Footer>
    </Layout>
  );
};


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