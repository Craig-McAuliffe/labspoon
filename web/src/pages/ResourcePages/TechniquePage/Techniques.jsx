import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {AuthRoute} from '../../../routes';
import EditTechniquePage from './EditTechniquePage';
import TechniquePage from './TechniquePage';

export default function Techniques() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <AuthRoute path={`${path}/edit`}>
        <EditTechniquePage />
      </AuthRoute>
      <Route path={`${path}`}>
        <TechniquePage />
      </Route>
    </Switch>
  );
}
