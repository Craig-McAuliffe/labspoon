import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import {AuthRoute} from '../../../routes';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import GroupPage from '.';
import CreateGroupPage from '../../../components/Group/CreateGroupPage/CreateGroupPage';
import EditGroupPage from './EditGroupPage';
import GroupMemberZone from './GroupMemberZone';

export default function Groups() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <AuthRoute path={`${path}/create`}>
        <CreateGroupPage />
      </AuthRoute>
      <Route path={`${path}/:groupID`}>
        <GroupPages />
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

function GroupPages() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <AuthRoute path={`${path}/edit`}>
        <EditGroupPage />
      </AuthRoute>
      <AuthRoute path={`${path}/memberZone`}>
        <GroupMemberZone />
      </AuthRoute>
      <Route path={`${path}/:routedTabID`}>
        <GroupPage />
      </Route>
      <Route path={`${path}`}>
        <GroupPage />
      </Route>
    </Switch>
  );
}
