import React, {useState, useEffect} from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {getGroup} from '../../helpers/groups';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

const INFO_TAB = 'info';
const POSTS_TAB = 'posts';
const PUBLICATIONS_TAB = 'publications';

const tabIDToDisplayName = {
  INFO_TAB: 'Info',
  POSTS_TAB: 'Posts',
  PUBLICATIONS_TAB: 'Publications',
};
console.log(tabIDToDisplayName);

export default function EditGroupPage() {
  const {path} = useRouteMatch();
  const groupID = useParams().groupID;
  const [group, setGroup] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  console.log(group);

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
        <h1>info tab</h1>
      </Route>
      <Route path={`${path}/${POSTS_TAB}`}>
        <h1>posts tab</h1>
      </Route>
      <Route path={`${path}/${PUBLICATIONS_TAB}`}>
        <h1>publications tab</h1>
      </Route>
      <Route path={`${path}`}>
        <h1>info tab</h1>
      </Route>
    </Switch>
  );
}
