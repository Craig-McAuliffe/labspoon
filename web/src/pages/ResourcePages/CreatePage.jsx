import React, {useContext} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {AuthContext} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import CreateOpenPosition from '../../components/OpenPosition/CreateOpenPosition';
import {PaddedPageContainer} from '../../components/Layout/Content';

import './CreatePage.css';
import LightTabLink, {
  LightTabContainer,
} from '../../components/Navigation/LightTab';
export default function CreatePage() {
  const {user, userProfile, authLoaded} = useContext(AuthContext);
  if (!authLoaded) return <LoadingSpinner />;
  if (!user) return <Redirect to="/signup" />;
  if (userProfile && !userProfile.name) return <Redirect to="/userName" />;

  return (
    <PaddedPageContainer>
      <p className="create-page-create-title">CREATE</p>
      <LightTabContainer>
        <LightTabLink name="Post" link="/create/post" />
        <LightTabLink name="Group" link="/create/group" />
        <LightTabLink name="Open Position" link="/create/openPosition" />
      </LightTabContainer>
      <div>
        <Switch>
          <Route path="/create/post">
            <CreatePost keepExpanded shouldRedirect={true} />
          </Route>
          <Route path="/create/group">
            <CreateGroupPage />
          </Route>
          <Route path="/create/openPosition/:groupID?">
            <CreateOpenPosition />
          </Route>
          <Route path="/create">
            <Redirect to="/create/post" />
          </Route>
        </Switch>
      </div>
    </PaddedPageContainer>
  );
}
