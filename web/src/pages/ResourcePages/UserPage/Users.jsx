import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import EditUserPage from './EditUserPage';
import UserPage from '.';
import AuthEditUser from './AuthEditUser';

export default function Users() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/:userID/edit`}>
        <AuthEditUser>
          <EditUserPage />
        </AuthEditUser>
      </Route>
      <Route path={`${path}/:userID`}>
        <UserPage />
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
