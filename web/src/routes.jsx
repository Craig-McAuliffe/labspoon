import React, {useContext, Suspense} from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';
import {AuthContext} from './App';

import {Switch, Route, Redirect} from 'react-router-dom';

import {LoadingSpinnerPage} from './components/LoadingSpinner/LoadingSpinner';

/**
 * Top level routing structure for the app.
 */
export default function Routes({user, setUser}) {
  return (
    <Suspense fallback={<LoadingSpinnerPage />}>
      <Switch>
        <Route path="/">
          <OfflineNotice />
        </Route>
      </Switch>
    </Suspense>
  );
}

function OfflineNotice() {
  return (
    <div className="offline-notice-page">
      <h2>We have shut Labspoon down for the time being.</h2>
      <p>Feel free to follow Labspoon on Twitter for any future updates.</p>
    </div>
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
