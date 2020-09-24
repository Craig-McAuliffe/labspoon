import React, {useContext} from 'react';
import PropTypes from 'prop-types';

import Spinner from 'react-bootstrap/Spinner';

import {AuthContext} from './App';

import {Switch, Route, Redirect} from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import BookmarksPage from './pages/BookmarksPage';
import FollowingFeedPage from './pages/FollowingFeedPage';
import GraphPage from './pages/GraphPage';
import GroupPage from './pages/ResourcePages/GroupPage';
import CreateGroupPage from './pages/Groups/CreateGroupPage/CreateGroupPage';
import FollowsPage from './pages/FollowsPage';
import SearchPage from './pages/SearchPage';
import UserPage from './pages/ResourcePages/UserPage';
import LoginPage from './pages/LoginPage';
import PublicationPage from './pages/ResourcePages/PublicationPage/PublicationPage';
import PostPage from './pages/ResourcePages/PostPage';
import TopicPage from './pages/TopicPage';
import FrontierPage from './pages/FrontierPage';

/**
 * Top level routing structure for the app.
 */
export default function Routes({user, setUser}) {
  return (
    <Switch>
      <Route exact path="/">
        <FollowingFeedPage />
      </Route>
      <Route exact path="/frontier">
        <FrontierPage />
      </Route>
      <Route path="/login">
        <LoginPage />
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
      <AuthRoute user={user} path="/group/create">
        <CreateGroupPage />
      </AuthRoute>
      <Route path="/group/:groupID">
        <GroupPage />
      </Route>
      <AuthRoute user={user} path="/follows">
        <FollowsPage />
      </AuthRoute>
      <Route path="/search/:query?">
        <SearchPage />
      </Route>
      <Route user={user} path="/user/:userID">
        <UserPage />
      </Route>
      <Route path="/publication/:publicationID">
        <PublicationPage />
      </Route>
      <Route path="/post/:postID">
        <PostPage />
      </Route>
      <Route path="/topic/:topicID">
        <TopicPage />
      </Route>
      <Route path="/">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

/**
 * Route wrapper that redirects to the login screen if the user is not
 * authenticated
 * @return {Route}
 */
function AuthRoute({children, ...rest}) {
  const {user} = useContext(AuthContext);

  function render({location}) {
    if (!!user) {
      return children;
    } else if (localStorage.getItem('labspoon.expectSignIn')) {
      return <Spinner animation="border" role="status" />;
    } else {
      return <Redirect to={{pathname: '/login', state: {from: location}}} />;
    }
  }

  return <Route {...rest} render={render} />;
}
AuthRoute.propTypes = {
  children: PropTypes.element,
};
