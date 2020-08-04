import React from 'react';

import {Switch, Route, Redirect} from 'react-router-dom';
import SettingsPage from './Pages/SettingsPage';
import BookmarksPage from './Pages/BookmarksPage';
import FollowingFeedPage from './Pages/FollowingFeedPage';
import GraphPage from './Pages/GraphPage';
import GroupPage from './Pages/GroupPage';
import FollowsPage from './Pages/FollowsPage';
import SearchPage from './Pages/SearchPage';
import ProfilePage from './Pages/ProfilePage';
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
