import React from 'react';
import PropTypes from 'prop-types';

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

/**
 * Top level routing structure for the app.
*/
export default function Routes(user, setUser) {
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

/**
* Route wrapper that redirects to the login screen if the user is not
* authenticated
* @return {Route}
*/
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
AuthRoute.propTypes = {
  user: PropTypes.any.isRequired,
  children: PropTypes.element,
};

