import React, {useContext} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {AuthContext} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import CreateOpenPosition from '../../components/OpenPosition/CreateOpenPosition';
import CreateTechnique from '../../components/Techniques/CreateTechnique';
import LightTabLink, {
  LightTabContainer,
} from '../../components/Navigation/LightTab';
import {PaddedPageContainer} from '../../components/Layout/Content';
import CreateResearchFocus from '../../components/ResearchFocus/CreateResearchFocus';

import './CreatePage.css';

export default function CreatePage() {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;
  if (!userID) return <LoadingSpinner />;
  return (
    <PaddedPageContainer>
      <LightTabContainer>
        <LightTabLink name="Post" link="/create/post" />
        <LightTabLink name="Group" link="/create/group" />
        <LightTabLink name="Open Position" link="/create/openPosition" />
        <LightTabLink name="Technique" link="/create/technique" />

        <LightTabLink name="Research Focus" link="/create/researchFocus" />
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
          <Route path="/create/technique/:groupID?">
            <CreateTechnique />
          </Route>
          <Route path="/create/researchFocus/:groupID?">
            <CreateResearchFocus />
          </Route>
          <Route path="/create">
            <Redirect to="/create/post" />
          </Route>
        </Switch>
      </div>
    </PaddedPageContainer>
  );
}
