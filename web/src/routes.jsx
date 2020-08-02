import React from 'react';

import {Switch, Route, Link, Redirect} from 'react-router-dom';
import AccountPage from './Pages/AccountPage';
import BookmarksPage from './Pages/BookmarksPage';
import FollowingFeedPage from './Pages/FollowingFeedPage';
import GraphPage from './Pages/GraphPage';
import GroupPage from './Pages/GroupPage';
import ManageFollowsPage from './Pages/ManageFollowsPage';
import SearchPage from './Pages/SearchPage';
import UserProfilePage from './Pages/UserProfilePage';
import LoginPage from './Pages/LoginPage';

const Routes = (user, setUser) => {
  return (
    <Switch>
      <Route exact path="/">
        <FollowingFeedPage />
      </Route>
      <Route path="/login">
        <LoginPage user={user} setUser={setUser} />
      </Route>
      <AuthRoute user={user} path="/account">
        <AccountPage />
      </AuthRoute>
      <AuthRoute user={user} path="/bookmarks">
        <BookmarksPage />
      </AuthRoute>
      <Route path="/graph">
        <GraphPage />
      </Route>
      <Route path="/group">
        <GroupPage />
      </Route>
      <AuthRoute user={user} path="/managefollows">
        <ManageFollowsPage />
      </AuthRoute>
      <Route path="/search">
        <SearchPage />
      </Route>
      <AuthRoute user={user} path="/userprofile">
        <UserProfilePage />
      </AuthRoute>
    </Switch>
  );
};

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
// Redirects to login screen if not authenticated
export default Routes;
