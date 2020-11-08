// custom search logic removed after 9ebf31106b04400309e7266010aca27f9ae96342
// in favour of algolia
import React, {useState, useEffect} from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import qs from 'qs';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Index,
  Configure,
  connectStateResults,
} from 'react-instantsearch-dom';
import {abbrEnv} from '../../config';

import {searchClient} from '../../algolia';
import {searchStateToURL, createURL} from '../../helpers/search';

import {GenericListItem} from '../../components/Results/Results';
import {MicrosoftAcademicKnowledgeAPIPublicationResults} from '../../components/Publication/MicrosoftResults';

import {dbPublicationToJSPublication} from '../../helpers/publications';

import 'instantsearch.css/themes/algolia.css';

import './SearchPage.css';
import {useContext} from 'react';
import {FeatureFlags} from '../../App';

const OVERVIEW = 'Overview';
const PUBLICATIONS = 'Publications';
const POSTS = 'Posts';
const USERS = 'Users';
const GROUPS = 'Groups';
const TOPICS = 'Topics';

const DEBOUNCE_TIME = 700;
let currentTab;

export default function SearchPage() {
  const location = useLocation();
  const history = useHistory();
  const [tab, setTab] = useState(OVERVIEW);
  const [searchState, setSearchState] = useState(urlToSearchState(location));
  const setStateId = React.useRef();
  const fflags = useContext(FeatureFlags);

  useEffect(() => {
    const nextSearchState = urlToSearchState(location);
    if (JSON.stringify(searchState) !== JSON.stringify(nextSearchState)) {
      setSearchState(nextSearchState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    currentTab = tab;
  }, [tab]);

  function onSearchStateChange(nextSearchState) {
    clearTimeout(setStateId.current);

    setStateId.current = setTimeout(() => {
      history.push(
        searchStateToURL(location, nextSearchState),
        nextSearchState
      );
    }, DEBOUNCE_TIME);

    setSearchState(nextSearchState);
  }

  const tabs = [OVERVIEW, PUBLICATIONS, POSTS, USERS, GROUPS, TOPICS].map(
    (tabName) => (
      <button
        onClick={() => setTab(tabName)}
        key={tabName}
        className={tabName === tab ? 'feed-tab-active' : 'feed-tab-inactive'}
      >
        <h3>{tabName}</h3>
      </button>
    )
  );

  let results;
  switch (tab) {
    case OVERVIEW:
      results = <OverviewResults setTab={setTab} />;
      break;
    case PUBLICATIONS:
      results = fflags.has('microsoft-academic-knowledge-api-publications') ? (
        <MicrosoftAcademicKnowledgeAPIPublicationResults
          query={searchState.query}
        />
      ) : (
        <PublicationsResults />
      );
      break;
    case POSTS:
      results = <PostsResults />;
      break;
    case USERS:
      results = <UsersResults />;
      break;
    case GROUPS:
      results = <GroupsResults />;
      break;
    case TOPICS:
      results = <TopicsResults />;
      break;
    default:
      break;
  }

  return (
    <>
      <div className="content-layout">
        <div className="feed-container">
          <div className="search-page-search-container">
            <InstantSearch
              searchClient={searchClient}
              indexName={abbrEnv + '_USERS'}
              searchState={searchState}
              onSearchStateChange={onSearchStateChange}
              createURL={createURL}
            >
              <SearchBox
                translations={{
                  placeholder: 'Edit your query',
                }}
                submit={<img src="" alt="" />}
              />
              <div className="feed-tabs-container">
                <div className="feed-tabs-layout">{tabs}</div>
              </div>
              {searchState.query ? results : <></>}
            </InstantSearch>
          </div>
        </div>
      </div>
    </>
  );
}

const IndexResults = connectStateResults(
  ({searchState, searchResults, children}) => {
    if (searchResults && searchResults.nbHits !== 0) return children;
    if (currentTab === OVERVIEW) {
      if (searchResults) {
        if (searchResults.index.includes('POSTS'))
          return <div>No results were found for {searchState.query}.</div>;
        return null;
      }
    } else
      return (
        <div>
          No {currentTab} were found for {searchState.query}. Check the other
          tabs or try a different query.
        </div>
      );
    return null;
  }
);

// Adds a 'see more' button to the end of a hits component. Used for switching to tabs from the federated overview search.
function SeeMoreWrapper({onClick, resourceType, children}) {
  const Wrapper = connectStateResults(
    ({searchState, searchResults, children}) => {
      if (searchResults && searchResults.nbHits !== 0) {
        return (
          <>
            {children}
            <button onClick={onClick}>See more {resourceType}</button>
          </>
        );
      } else {
        return children;
      }
    }
  );
  return <Wrapper>{children}</Wrapper>;
}

function OverviewResultsSection({
  setTab,
  children,
  indexSuffix,
  tabName,
  resourceType,
}) {
  return (
    <Index indexName={abbrEnv + indexSuffix}>
      <IndexResults>
        <SeeMoreWrapper
          onClick={() => setTab(tabName)}
          resourceType={resourceType}
        >
          {children}
        </SeeMoreWrapper>
      </IndexResults>
    </Index>
  );
}

const PublicationHitsComponent = () => (
  <Hits
    hitComponent={({hit}) => (
      <GenericListItem result={dbPublicationToJSPublication(hit)} />
    )}
  />
);

const PostHitsComponent = () => (
  <Hits
    hitComponent={({hit}) => {
      hit.id = hit.objectID;
      return <GenericListItem result={hit} />;
    }}
  />
);

const GroupHitsComponent = () => (
  <Hits
    hitComponent={({hit}) => {
      hit.id = hit.objectID;
      return <GenericListItem result={hit} />;
    }}
  />
);

const UserHitsComponent = () => (
  <Hits hitComponent={({hit}) => <GenericListItem result={hit} />} />
);

const TopicHitsComponent = () => (
  <Hits hitComponent={({hit}) => <GenericListItem result={hit} />} />
);

const OverviewResults = ({setTab}) => (
  <>
    <Configure hitsPerPage={3} />
    <OverviewResultsSection
      setTab={setTab}
      indexSuffix={'_PUBLICATIONS'}
      tabName={PUBLICATIONS}
      resourceType={'Publications'}
    >
      <PublicationHitsComponent />
    </OverviewResultsSection>
    <OverviewResultsSection
      setTab={setTab}
      indexSuffix={'_POSTS'}
      tabName={POSTS}
      resourceType={'Posts'}
    >
      <PostHitsComponent />
    </OverviewResultsSection>
    <OverviewResultsSection
      setTab={setTab}
      indexSuffix={'_USERS'}
      tabName={USERS}
      resourceType={'Users'}
    >
      <UserHitsComponent />
    </OverviewResultsSection>
    <OverviewResultsSection
      setTab={setTab}
      indexSuffix={'_GROUPS'}
      tabName={GROUPS}
      resourceType={'Groups'}
    >
      <GroupHitsComponent />
    </OverviewResultsSection>
    <OverviewResultsSection
      setTab={setTab}
      indexSuffix={'_TOPICS'}
      tabName={TOPICS}
      resourceType={'Topics'}
    >
      <TopicHitsComponent />
    </OverviewResultsSection>
  </>
);

const PublicationsResults = () => (
  <Index indexName={abbrEnv + '_PUBLICATIONS'}>
    <IndexResults>
      <Hits
        hitComponent={({hit}) => (
          <GenericListItem result={dbPublicationToJSPublication(hit)} />
        )}
      />
    </IndexResults>
  </Index>
);

const UsersResults = () => (
  <Index indexName={abbrEnv + '_USERS'}>
    <IndexResults>
      <Hits hitComponent={({hit}) => <GenericListItem result={hit} />} />
    </IndexResults>
  </Index>
);

const GroupsResults = () => (
  <Index indexName={abbrEnv + '_GROUPS'}>
    <IndexResults>
      <Hits
        hitComponent={({hit}) => {
          hit.id = hit.objectID;
          return <GenericListItem result={hit} />;
        }}
      />
    </IndexResults>
  </Index>
);

const PostsResults = () => (
  <Index indexName={abbrEnv + '_POSTS'}>
    <IndexResults>
      <Hits
        hitComponent={({hit}) => {
          hit.id = hit.objectID;
          return <GenericListItem result={hit} />;
        }}
      />
    </IndexResults>
  </Index>
);

const TopicsResults = () => {
  return (
    <Index indexName={abbrEnv + '_TOPICS'}>
      <IndexResults>
        <Hits hitComponent={({hit}) => <GenericListItem result={hit} />} />
      </IndexResults>
    </Index>
  );
};

const urlToSearchState = (location) => qs.parse(location.search.slice(1));
