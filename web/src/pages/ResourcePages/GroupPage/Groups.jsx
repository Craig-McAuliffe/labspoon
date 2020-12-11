import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {AuthRoute} from '../../../routes';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import GroupPage from '.';
import CreateGroupPage from '../../../components/Group/CreateGroupPage/CreateGroupPage';
import EditGroupPage from './EditGroupPage';

export default function Groups() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <AuthRoute path={`${path}/create`}>
        <CreateGroupPage />
      </AuthRoute>
      <AuthRoute path={`${path}/:groupID/edit`}>
        <EditGroupPage />
      </AuthRoute>
      <Route path={`${path}/:groupID`}>
        <GroupPage />
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
