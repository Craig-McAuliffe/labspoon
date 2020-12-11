import React, {useState, useEffect} from 'react';
import {Link, Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {getGroup} from '../../helpers/groups';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import EditGroupInfo from '../ResourcePages/GroupPage/EditGroupInfo';
import EditGroupPosts from '../ResourcePages/GroupPage/EditGroupPosts';
import EditGroupPublications from '../ResourcePages/GroupPage/EditGroupPublications';
import EditGroupPhotos from '../ResourcePages/GroupPage/EditGroupPhotos';

const INFO_TAB = 'info';
const POSTS_TAB = 'posts';
const PUBLICATIONS_TAB = 'publications';
const PHOTOS_TAB = 'photos';

const tabIDToDisplayName = {
  [INFO_TAB]: 'Info',
  [POSTS_TAB]: 'Posts',
  [PUBLICATIONS_TAB]: 'Publications',
  [PHOTOS_TAB]: 'Photos',
};

export default function EditGroupPage() {
  const {path, url} = useRouteMatch();
  const groupID = useParams().groupID;
  const [group, setGroup] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const tabs = [INFO_TAB, POSTS_TAB, PUBLICATIONS_TAB, PHOTOS_TAB];
  const groupURL = url.slice(0, url.length - '/edit'.length);

  useEffect(() => {
    Promise.resolve(getGroup(groupID))
      .then((groupData) => {
        if (!groupData) {
          setNotFound(true);
        }
        setGroup(groupData);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [groupID]);

  if (loading) return <LoadingSpinner />;
  if (notFound) return <NotFoundPage />;

  return (
    <Switch>
      <Route path={`${path}/${INFO_TAB}`}>
        <div className="content-layout">
          <div className="group-details">
            <EditGroupTabs tabs={tabs} activeTab={INFO_TAB} />
            <ReturnToGroupPageButton url={groupURL} />
            <EditGroupInfo groupData={group} />
          </div>
        </div>
      </Route>
      <Route path={`${path}/${POSTS_TAB}`}>
        <EditGroupPosts groupID={groupID}>
          <EditGroupTabs tabs={tabs} activeTab={POSTS_TAB} />
          <ReturnToGroupPageButton url={groupURL} />
        </EditGroupPosts>
      </Route>
      <Route path={`${path}/${PUBLICATIONS_TAB}`}>
        <EditGroupPublications groupID={groupID}>
          <EditGroupTabs tabs={tabs} activeTab={PUBLICATIONS_TAB} />
          <ReturnToGroupPageButton url={groupURL} />
        </EditGroupPublications>
      </Route>
      <Route path={`${path}/${PHOTOS_TAB}`}>
        <EditGroupPhotos>
          <EditGroupTabs tabs={tabs} activeTab={PHOTOS_TAB} />
          <ReturnToGroupPageButton url={groupURL} />
        </EditGroupPhotos>
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

function ReturnToGroupPageButton({url}) {
  return (
    <div className="edit-group-posts-cancel">
      <Link to={url}>
        <button>
          <h4>Back to Public View</h4>
        </button>
      </Link>
    </div>
  );
}

export function EditGroupTabs({tabs, activeTab}) {
  return tabs.map((tab) => {
    return (
      <EditGroupTab
        key={tab}
        value={tabIDToDisplayName[tab]}
        active={tab === activeTab}
        route={`${tab}`}
      />
    );
  });
}

function EditGroupTab({value, active, route}) {
  return (
    <Link to={route}>
      <button>
        <h2
          className={
            active ? 'edit-group-tab-active' : 'edit-group-tab-inactive'
          }
        >
          {value}
        </h2>
      </button>
    </Link>
  );
}
