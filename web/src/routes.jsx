import React, {useContext} from 'react';
import PropTypes from 'prop-types';

import Spinner from 'react-bootstrap/Spinner';

import {AuthContext, FeatureFlags} from './App';

import {Switch, Route, Redirect} from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import BookmarksPage from './pages/BookmarksPage';
import FollowingFeedPage from './pages/FollowingFeedPage';
import GraphPage from './pages/GraphPage';
import FollowsPage from './pages/FollowsPage';
import SearchPage from './pages/SearchPage';
import {SkeletonUserPage} from './pages/ResourcePages/UserPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginSignup/LoginPage';
import SignupPage from './pages/LoginSignup/SignupPage';
import {MAGPublicationRouter} from './pages/ResourcePages/PublicationPage/PublicationPage';
import Publications from './pages/ResourcePages/PublicationPage/Publications';
import PostPage from './pages/ResourcePages/PostPage';
import TopicPage, {MAGFieldRouter} from './pages/TopicPage';
import NewsPage from './pages/NewsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import OnboardingPage from './pages/OnboardingPage';
import OpenPositionPage from './pages/ResourcePages/OpenPositionPage/OpenPositionPage';
import CreatePage from './pages/ResourcePages/CreatePage';
import Articles from './pages/Articles/Articles';
import Groups from './pages/ResourcePages/GroupPage/Groups';
import Techniques from './pages/ResourcePages/TechniquePage/Techniques';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import Users from './pages/ResourcePages/UserPage/Users';
import ChooseUserName from './pages/LoginSignup/ChooseUserName/ChooseUserName';
import ContactPage from './pages/ContactPage/ContactPage';
import PoliciesPage from './pages/PoliciesPage/PoliciesPage';
import CookiesPolicyPage from './pages/Info/CookiesPolicyPage';
import ResearchFocuses from './pages/ResourcePages/ResearchFocusPage/ResearchFocuses';

/**
 * Top level routing structure for the app.
 */
export default function Routes({user, setUser}) {
  const featureFlags = useContext(FeatureFlags);
  return (
    <Switch>
      <AuthRoute exact path="/" redirect="/about">
        <FollowingFeedPage />
      </AuthRoute>
      {featureFlags.has('news') ? (
        <Route exact path="/news">
          <NewsPage />
        </Route>
      ) : undefined}
      <Route exact path="/login">
        <LoginPage />
      </Route>
      <Route exact path="/signup">
        <SignupPage />
      </Route>
      <Route path="/userName">
        <ChooseUserName />
      </Route>
      <AuthRoute user={user} path="/settings">
        <SettingsPage />
      </AuthRoute>
      <AuthRoute user={user} path="/create">
        <CreatePage />
      </AuthRoute>
      <AuthRoute user={user} path="/bookmarks">
        <BookmarksPage />
      </AuthRoute>
      <Route path="/graph">
        <GraphPage />
      </Route>
      <Route path="/group">
        <Groups />
      </Route>
      <AuthRoute user={user} path="/follows">
        <FollowsPage />
      </AuthRoute>
      <Route path="/search/:tab?/:query?">
        <SearchPage />
      </Route>
      <Route user={user} path="/user">
        <Users />
      </Route>
      <Route user={user} path="/externaluser/:userID">
        <SkeletonUserPage />
      </Route>
      <Route path="/publication">
        <Publications />
      </Route>
      <Route path="/magPublication/:magPublicationID">
        <MAGPublicationRouter />
      </Route>
      <Route path="/post/:postID">
        <PostPage />
      </Route>
      <Route path="/topic/:topicID">
        <TopicPage />
      </Route>
      <Route path="/openPosition/:openPositionID">
        <OpenPositionPage />
      </Route>
      <Route path="/magField/:magFieldID">
        <MAGFieldRouter />
      </Route>
      <AuthRoute user={user} path="/onboarding/:onboardingStage">
        <OnboardingPage />
      </AuthRoute>
      <Route path="/articles">
        <Articles />
      </Route>
      <Route path="/policies">
        <PoliciesPage />
      </Route>
      <Route path="/privacy-policy">
        <PrivacyPolicyPage />
      </Route>
      <Route path="/cookies-policy">
        <CookiesPolicyPage />
      </Route>
      <Route path="/contact">
        <ContactPage />
      </Route>
      <Route exact path="/about">
        <AboutPage />
      </Route>
      <Route path="/technique/:techniqueID">
        <Techniques />
      </Route>
      <Route path="/researchFocus/:researchFocusID">
        <ResearchFocuses />
      </Route>
      <Route path="/notfound">
        <NotFoundPage />
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
export function AuthRoute({children, redirect, ...rest}) {
  const {user} = useContext(AuthContext);

  function render({location}) {
    if (!!user) {
      return children;
    } else if (localStorage.getItem('labspoon.expectSignIn')) {
      return <Spinner animation="border" role="status" />;
    } else {
      return (
        <Redirect
          to={{
            pathname: redirect ? redirect : '/login',
            state: {from: location},
          }}
        />
      );
    }
  }

  return <Route {...rest} render={render} />;
}
AuthRoute.propTypes = {
  children: PropTypes.element,
};
