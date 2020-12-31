import React, {useContext} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {AuthContext, FeatureFlags} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import CreateOpenPosition from '../../components/OpenPosition/CreateOpenPosition';
import CreateTechnique from '../../components/Techniques/CreateTechnique';
import LightTabLink, {
  LightTabContainer,
} from '../../components/Navigation/LightTab';
import {PageContainer} from '../../components/Layout/Content';
import CreateResearchFocus from '../../components/ResearchFocus/CreateResearchFocus';

import './CreatePage.css';

export default function CreatePage() {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;
  const featureFlags = useContext(FeatureFlags);
  if (!userID) return <LoadingSpinner />;
  return (
    <PageContainer>
      <LightTabContainer>
        <LightTabLink name="Post" link="/create/post" />
        <LightTabLink name="Group" link="/create/group" />
        {featureFlags.has('create-open-position') ? (
          <LightTabLink name="Open Position" link="/create/openPosition" />
        ) : null}
        {featureFlags.has('techniques') && (
          <LightTabLink name="Technique" link="/create/technique" />
        )}
        {featureFlags.has('research-focus') && (
          <LightTabLink name="Research Focus" link="/create/researchFocus" />
        )}
      </LightTabContainer>
      <div>
        <Switch>
          <Route path="/create/post">
            <CreatePost
              keepExpanded
              redirect={<Redirect to={`/user/${userID}`} />}
            />
          </Route>
          <Route path="/create/group">
            <CreateGroupPage />
          </Route>
          <Route path="/create/openPosition/:groupID?">
            <CreateOpenPosition />
          </Route>
          {featureFlags.has('techniques') && (
            <Route path="/create/technique/:groupID?">
              <CreateTechnique />
            </Route>
          )}
          {featureFlags.has('research-focus') && (
            <Route path="/create/researchFocus/:groupID?">
              <CreateResearchFocus />
            </Route>
          )}
          <Route path="/create">
            <Redirect to="/create/post" />
          </Route>
        </Switch>
      </div>
    </PageContainer>
  );
}
