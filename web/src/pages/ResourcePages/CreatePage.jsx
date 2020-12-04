import React, {useContext} from 'react';
import {Link, Redirect, Route, Switch, useLocation} from 'react-router-dom';
import {AuthContext} from '../../App';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import CreateGroupPage from '../Groups/CreateGroupPage/CreateGroupPage';

import './CreatePage.css';

export default function CreatePage() {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;

  if (!userID) return <LoadingSpinner />;

  return (
    <div className="content-layout">
      <div className="middle-column" style={{'grid-column': '2/3'}}>
        <div className="light-tab-group">
          <LightTabLink name="Post" link="/create/post" />
          <LightTabLink name="Group" link="/create/group" />
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
            <Route path="/create">
              <Redirect to="/create/post" />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}

function LightTabLink({name, link}) {
  const location = useLocation();
  return (
    <Link to={link}>
      <button type="button">
        <h2
          className={
            location.pathname === link
              ? 'light-tab-active'
              : 'light-tab-inactive'
          }
        >
          {name}
        </h2>
      </button>
    </Link>
  );
}
