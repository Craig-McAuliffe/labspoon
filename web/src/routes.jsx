import React from 'react';

import {Switch, Route, Redirect} from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import BookmarksPage from './pages/BookmarksPage';
import FollowingFeedPage from './pages/FollowingFeedPage';
import GraphPage from './pages/GraphPage';
import GroupPage from './pages/GroupPage';
import FollowsPage from './pages/FollowsPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

const Routes = (user, setUser) => {
  return (
    <Switch>
      <Route exact path="/">
        <FollowingFeedPage />
      </Route>
      <Route path="/login">
        <LoginPage user={user} setUser={setUser} />
      </Route>
      <AuthRoute user={user} path="/settings">
        <SettingsPage />
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
      <AuthRoute user={user} path="/follows">
        <FollowsPage />
      </AuthRoute>
      <Route path="/search">
        <SearchPage />
      </Route>
      <AuthRoute user={user} path="/profile">
        <ProfilePage />
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
