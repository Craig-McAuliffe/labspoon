import React, {lazy, useContext, Suspense} from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';

import {AuthContext, FeatureFlags} from './App';

import {Switch, Route, Redirect} from 'react-router-dom';
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const GraphPage = lazy(() => import('./pages/GraphPage'));
const FollowsPage = lazy(() => import('./pages/FollowsPage'));
const LoginPage = lazy(() => import('./pages/LoginSignup/LoginPage'));
const SignupPage = lazy(() => import('./pages/LoginSignup/SignupPage'));
const Publications = lazy(() =>
  import('./pages/ResourcePages/PublicationPage/Publications')
);
const PostPage = lazy(() => import('./pages/ResourcePages/PostPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CreatePage = lazy(() => import('./pages/ResourcePages/CreatePage'));
const Articles = lazy(() => import('./pages/Articles/Articles'));
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage/PrivacyPolicyPage')
);
const ContactPage = lazy(() => import('./pages/ContactPage/ContactPage'));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage/PoliciesPage'));
const CookiesPolicyPage = lazy(() => import('./pages/Info/CookiesPolicyPage'));
const AboutUsPage = lazy(() => import('./pages/AboutPage/AboutUsPage'));
const ResearchFocuses = lazy(() =>
  import('./pages/ResourcePages/ResearchFocusPage/ResearchFocuses')
);
const Techniques = lazy(() =>
  import('./pages/ResourcePages/TechniquePage/Techniques')
);
const ChooseUserName = lazy(() =>
  import('./pages/LoginSignup/ChooseUserName/ChooseUserName')
);
const OpenPositionPage = lazy(() =>
  import('./pages/ResourcePages/OpenPositionPage/OpenPositionPage')
);
const QuickCreateGroup = lazy(() =>
  import('./pages/ResourcePages/QuickCreateGroup')
);
const GeneratedPasswordPage = lazy(() =>
  import('./pages/GeneratedPasswordPage')
);
const PasswordResetPage = lazy(() =>
  import('./pages/AuthenticationPages/PasswordResetPage')
);
const Groups = lazy(() => import('./pages/ResourcePages/GroupPage/Groups'));

import {SkeletonUserPage} from './pages/ResourcePages/UserPage';
import AboutPage from './pages/AboutPage';
import {MAGPublicationRouter} from './pages/ResourcePages/PublicationPage/PublicationPage';
import TopicPage, {MAGFieldRouter} from './pages/TopicPage';
import Users from './pages/ResourcePages/UserPage/Users';
import {LoadingSpinnerPage} from './components/LoadingSpinner/LoadingSpinner';
import SearchPage from './pages/SearchPage';
import FollowingFeedPage from './pages/FollowingFeedPage';

/**
 * Top level routing structure for the app.
 */
export default function Routes({user, setUser}) {
  const featureFlags = useContext(FeatureFlags);
  return (
    <Suspense fallback={<LoadingSpinnerPage />}>
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
        <Route path="/aboutUs">
          <AboutUsPage />
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
        <Route path="/quickCreateGroup">
          <QuickCreateGroup />
        </Route>
        <Route path="/generatedPassword">
          <GeneratedPasswordPage />
        </Route>
        <Route path="/authentication">
          <PasswordResetPage />
        </Route>
        <Route path="/notfound">
          <NotFoundPage />
        </Route>
        <Route path="/">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Suspense>
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
