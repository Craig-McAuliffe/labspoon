import React, {useContext} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {AuthContext} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import CreateGroupPage from '../Groups/CreateGroupPage/CreateGroupPage';
import CreateOpenPosition from '../../components/OpenPosition/CreateOpenPosition';
import LightTabLink from '../../components/Navigation/LightTabLink';

import './CreatePage.css';

export default function CreatePage() {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;

  if (!userID) return <LoadingSpinner />;

  return (
    <div className="content-layout">
      <div className="feed-container">
        <div className="light-tab-group">
          <LightTabLink name="Post" link="/create/post" />
          <LightTabLink name="Group" link="/create/group" />
          <LightTabLink name="Open Position" link="/create/open-position" />
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
            <Route path="/create/open-position">
              <CreateOpenPosition />
            </Route>
            <Route path="/create">
              <Redirect to="/create/post" />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
