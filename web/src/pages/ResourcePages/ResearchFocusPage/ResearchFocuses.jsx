import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {AuthRoute} from '../../../routes';
import EditResearchFocusPage from './EditResearchFocusPage';
import ResearchFocusPage from './ResearchFocusPage';

export default function ResearchFocuses() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <AuthRoute path={`${path}/edit`}>
        <EditResearchFocusPage />
      </AuthRoute>
      <Route path={`${path}`}>
        <ResearchFocusPage />
      </Route>
    </Switch>
  );
}
