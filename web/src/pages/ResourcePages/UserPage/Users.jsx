import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {AuthRoute} from '../../../routes';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import EditUserPage from './EditUserPage';
import UserPage from '.';

export default function Users() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <AuthRoute path={`${path}/:userID/edit`}>
        <EditUserPage />
      </AuthRoute>
      <Route path={`${path}/:userID`}>
        <UserPage />
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
