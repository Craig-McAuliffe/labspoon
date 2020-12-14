import React, {useContext} from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {FeatureFlags} from '../../App';
import {AuthRoute} from '../../routes';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import CreateArticlePage from './CreateArticlePage';

export default function Articles() {
  const featureFlags = useContext(FeatureFlags);
  const {path} = useRouteMatch();

  if (!featureFlags.has('articles')) return <NotFoundPage />;

  return (
    <Switch>
      <AuthRoute path={`${path}/create`}>
        <CreateArticlePage />
      </AuthRoute>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
