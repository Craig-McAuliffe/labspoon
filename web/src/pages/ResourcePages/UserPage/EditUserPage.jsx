import React from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import EditUserInfo from './EditUserInfo';
import EditUserPhotos from './EditUserPhotos';
import EditUserPublications from './EditUserPublications';
import LightTabLink, {
  LightTabContainer,
} from '../../../components/Navigation/LightTab';
import ReturnToPublicViewButton from '../../../components/Buttons/ReturnToPublicViewButton';

import './UserPage.css';
import './EditUserPage.css';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';

export const INFO_TAB = 'info';
const PHOTOS_TAB = 'photos';
const PUBLICATIONS_TAB = 'publications';

const tabIDToDisplayName = {
  [INFO_TAB]: 'Info',
  [PHOTOS_TAB]: 'Photos',
  [PUBLICATIONS_TAB]: 'Publications',
};

export default function EditUserPage() {
  const {path} = useRouteMatch();
  const userID = useParams().userID;

  const tabs = [INFO_TAB, PHOTOS_TAB, PUBLICATIONS_TAB];
  const publicViewURL = `/user/${userID}`;

  return (
    <Switch>
      <Route path={`${path}/${INFO_TAB}`}>
        <EditUserInfo>
          <EditProfileTabs tabs={tabs} activeTab={INFO_TAB} />
          <ReturnToPublicViewButton url={publicViewURL} />
        </EditUserInfo>
      </Route>
      <Route path={`${path}/${PHOTOS_TAB}`}>
        <EditUserPhotos>
          <EditProfileTabs tabs={tabs} activeTab={PHOTOS_TAB} />
          <ReturnToPublicViewButton url={publicViewURL} />
        </EditUserPhotos>
      </Route>
      <Route path={`${path}/${PUBLICATIONS_TAB}`}>
        <EditUserPublications>
          <EditProfileTabs tabs={tabs} activeTab={PUBLICATIONS_TAB} />
          <ReturnToPublicViewButton url={publicViewURL} />
        </EditUserPublications>
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

export function EditProfileTabs({tabs, activeTab}) {
  return (
    <LightTabContainer>
      {tabs.map((tab) => (
        <LightTabLink
          key={tab}
          name={tabIDToDisplayName[tab]}
          active={tab === activeTab}
          link={`${tab}`}
        />
      ))}
    </LightTabContainer>
  );
}
