import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import PublicationPage from './PublicationPage';
import SimilarPublicationsPage from './SimilarPublicationsPage';

export default function Publications() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}/:publicationID`}>
        <PublicationPage />
      </Route>
      <Route exact path={`${path}/:publicationID/similar`}>
        <SimilarPublicationsPage />
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
