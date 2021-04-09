import React, {useState, useEffect} from 'react';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {getGroup} from '../../../helpers/groups';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import EditGroupInfo from './EditGroupInfo';
import EditGroupPosts from './EditGroupPosts';
import EditGroupPublications from './EditGroupPublications';
import EditGroupPhotos from './EditGroupPhotos';
import EditGroupVideos from './EditGroupVideos';
import EditGroupTechniques from './EditGroupTechniques';
import EditGroupResearchFocuses from './EditGroupResearchFocuses';
import EditGroupOpenPositions from './EditGroupOpenPositions';
import LightTabLink, {
  LightTabContainer,
} from '../../../components/Navigation/LightTab';
import ReturnToPublicViewButton from '../../../components/Buttons/ReturnToPublicViewButton';
import EditGroupMembers from './EditGroupMembers';
import EditGroupOverviewPage from './EditGroupOverviewPage';

import './EditGroupPage.css';
import EditGroupDisplay from './EditGroupDisplay';

const INFO_TAB = 'info';
const POSTS_TAB = 'posts';
const MEMBERS_TAB = 'members';
const PUBLICATIONS_TAB = 'publications';
const PHOTOS_TAB = 'photos';
const VIDEOS_TAB = 'videos';
const TECHNIQUES_TAB = 'techniques';
const RESEARCHFOCUSES_TAB = 'researchFocuses';
const OPENPOSITIONS_TAB = 'openPositions';
const OVERVIEW_PAGE_TAB = 'overviewPage';
const DISPLAY_TAB = 'display';

const tabIDToDisplayName = {
  [INFO_TAB]: 'Info',
  [MEMBERS_TAB]: 'Members',
  [POSTS_TAB]: 'Posts',
  [PUBLICATIONS_TAB]: 'Publications',
  [PHOTOS_TAB]: 'Photos',
  [VIDEOS_TAB]: 'Videos',
  [TECHNIQUES_TAB]: 'Techniques',
  [RESEARCHFOCUSES_TAB]: 'Research Focuses',
  [OPENPOSITIONS_TAB]: 'Open Positions',
  [OVERVIEW_PAGE_TAB]: 'Overview Page',
  [DISPLAY_TAB]: 'Display',
};

export default function EditGroupPage() {
  const {path, url} = useRouteMatch();
  const groupID = useParams().groupID;
  const [group, setGroup] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const tabs = [
    INFO_TAB,
    DISPLAY_TAB,
    OVERVIEW_PAGE_TAB,
    MEMBERS_TAB,
    POSTS_TAB,
    PUBLICATIONS_TAB,
    PHOTOS_TAB,
    VIDEOS_TAB,
    TECHNIQUES_TAB,
    RESEARCHFOCUSES_TAB,
    OPENPOSITIONS_TAB,
  ];
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
        <EditGroupInfo groupData={group}>
          <EditGroupTabs tabs={tabs} activeTab={INFO_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupInfo>
      </Route>
      <Route path={`${path}/${MEMBERS_TAB}`}>
        <EditGroupMembers groupData={group}>
          <EditGroupTabs tabs={tabs} activeTab={MEMBERS_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupMembers>
      </Route>
      <Route path={`${path}/${POSTS_TAB}`}>
        <EditGroupPosts groupID={groupID} group={group}>
          <EditGroupTabs tabs={tabs} activeTab={POSTS_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupPosts>
      </Route>
      <Route path={`${path}/${PUBLICATIONS_TAB}`}>
        <EditGroupPublications groupID={groupID} groupData={group}>
          <EditGroupTabs tabs={tabs} activeTab={PUBLICATIONS_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupPublications>
      </Route>
      <Route path={`${path}/${PHOTOS_TAB}`}>
        <EditGroupPhotos>
          <EditGroupTabs tabs={tabs} activeTab={PHOTOS_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupPhotos>
      </Route>
      <Route path={`${path}/${VIDEOS_TAB}`}>
        <EditGroupVideos>
          <EditGroupTabs tabs={tabs} activeTab={VIDEOS_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupVideos>
      </Route>
      <Route path={`${path}/${TECHNIQUES_TAB}`}>
        <EditGroupTechniques>
          <EditGroupTabs tabs={tabs} activeTab={TECHNIQUES_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupTechniques>
      </Route>
      <Route path={`${path}/${RESEARCHFOCUSES_TAB}`}>
        <EditGroupResearchFocuses>
          <EditGroupTabs tabs={tabs} activeTab={RESEARCHFOCUSES_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupResearchFocuses>
      </Route>
      <Route path={`${path}/${OPENPOSITIONS_TAB}`}>
        <EditGroupOpenPositions>
          <EditGroupTabs tabs={tabs} activeTab={OPENPOSITIONS_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupOpenPositions>
      </Route>
      <Route path={`${path}/${OVERVIEW_PAGE_TAB}`}>
        <EditGroupOverviewPage groupData={group} groupID={groupID}>
          <EditGroupTabs tabs={tabs} activeTab={OVERVIEW_PAGE_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupOverviewPage>
      </Route>
      <Route path={`${path}/${DISPLAY_TAB}`}>
        <EditGroupDisplay groupData={group} groupID={groupID}>
          <EditGroupTabs tabs={tabs} activeTab={DISPLAY_TAB} />
          <ReturnToPublicViewButton url={groupURL} />
        </EditGroupDisplay>
      </Route>
      <Route path={`${path}`}>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

export function EditGroupTabs({tabs, activeTab}) {
  return (
    <div
      className={
        activeTab === POSTS_TAB || activeTab === PUBLICATIONS_TAB
          ? 'edit-group-page-margin-top'
          : ''
      }
    >
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
    </div>
  );
}
