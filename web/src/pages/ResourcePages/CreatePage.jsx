import React, {useContext} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {AuthContext, FeatureFlags} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import CreateOpenPosition from '../../components/OpenPosition/CreateOpenPosition';
import CreateTechnique from '../../components/Techniques/CreateTechnique';
import LightTabLink from '../../components/Navigation/LightTabLink';

import './CreatePage.css';
import {FeedContent} from '../../components/Layout/Content';
import CreateResearchFocus from '../../components/ResearchFocus/CreateResearchFocus';

export default function CreatePage() {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;
  const featureFlags = useContext(FeatureFlags);
  if (!userID) return <LoadingSpinner />;
  return (
    <FeedContent>
      <div className="light-tab-group">
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
      </div>
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
          <Route path="/create/openPosition">
            <CreateOpenPosition />
          </Route>
          {featureFlags.has('techniques') && (
            <Route path="/create/technique">
              <CreateTechnique />
            </Route>
          )}
          {featureFlags.has('research-focus') && (
            <Route path="/create/researchFocus">
              <CreateResearchFocus />
            </Route>
          )}
          <Route path="/create">
            <Redirect to="/create/post" />
          </Route>
        </Switch>
      </div>
    </FeedContent>
  );
}
