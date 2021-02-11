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
import {createURL} from '../../helpers/search';
import {GenericListItem} from '../../components/Results/Results';
import 'instantsearch.css/themes/algolia.css';
import {useContext} from 'react';
import SearchBar from '../../components/SearchBar';

import './SearchPage.css';
import LatestPosts from '../../components/Posts/LatestPosts/LatestPosts';

const OVERVIEW = 'Overview';
const POSTS = 'Posts';
const USERS = 'Users';
const GROUPS = 'Groups';
const TOPICS = 'Topics';

const urlToTabsMap = new Map([
  ['overview', OVERVIEW],
  ['posts', POSTS],
  ['users', USERS],
  ['groups', GROUPS],
  ['topics', TOPICS],
]);

const tabsToURLMap = new Map([
  [OVERVIEW, 'overview'],
  [POSTS, 'posts'],
  [USERS, 'users'],
  [GROUPS, 'groups'],
  [TOPICS, 'topics'],
]);

const SearchPageActiveTabContext = React.createContext();

export default function SearchPage() {
  const location = useLocation();
  const [tab, setTab] = useState(OVERVIEW);
  const [searchState, setSearchState] = useState(urlToSearchState(location));
  const history = useHistory();

  useEffect(() => {
    const tabPath = location.pathname.slice(1).split('/')[1];
    if (!urlToTabsMap.has(tabPath)) {
      setTab(OVERVIEW);
      return;
    }
    setTab(urlToTabsMap.get(tabPath));
  }, [location]);

  function updateTab(tab) {
    const tabPath = tabsToURLMap.get(tab);
    const searchURLParams = createURL(searchState);
    history.push(`/search/${tabPath}/${searchURLParams}`);
  }

  useEffect(() => {
    const nextSearchState = urlToSearchState(location);
    if (JSON.stringify(searchState) !== JSON.stringify(nextSearchState)) {
      setSearchState(nextSearchState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const tabs = [OVERVIEW, POSTS, USERS, GROUPS, TOPICS].map((tabName) => (
    <button
      onClick={() => updateTab(tabName)}
      key={tabName}
      className={tabName === tab ? 'feed-tab-active' : 'feed-tab-inactive'}
    >
      <h3>{tabName}</h3>
    </button>
  ));

  let results;
  switch (tab) {
    case OVERVIEW:
      results = <OverviewResults setTab={updateTab} />;
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
    <SearchPageActiveTabContext.Provider
      value={{
        activeTab: tab,
        setActiveTab: updateTab,
      }}
    >
      <div className="content-layout">
        <div className="feed-container">
          <div className="search-page-search-container">
            <InstantSearch
              searchClient={searchClient}
              indexName={tabToIndex(tab)}
              searchState={searchState}
              createURL={createURL}
              refresh
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
    </SearchPageActiveTabContext.Provider>
  );
}

const IndexResults = connectStateResults(
  ({searchState, searchResults, children}) => {
    const {activeTab} = useContext(SearchPageActiveTabContext);
    if (searchResults && searchResults.nbHits !== 0) {
      return children;
    }
    return (
      <>
        <div className="search-page-no-results-message">
          {`Hmm, we couldn't find any ${activeTab} for ${searchState.query}. You can check the other tabs though!`}
        </div>
        <TryAnotherSearch />
      </>
    );
  }
);

const AllResults = connectStateResults(({allSearchResults, children}) => {
  const noResultsDisplay = (
    <>
      <Index indexName={`${abbrEnv}_POSTS`} />
      <Index indexName={`${abbrEnv}_USERS`} />
      <Index indexName={`${abbrEnv}_GROUPS`} />
      <Index indexName={`${abbrEnv}_TOPICS`} />
      <div className="search-page-no-results-message">
        {`Hmm, looks like there's nothing on Labspoon that matches your search.`}
      </div>
      <TryAnotherSearch />
      <LatestPosts />
    </>
  );
  if (!allSearchResults) return noResultsDisplay;
  if (
    Object.values(allSearchResults).some(
      (individualIndexResults) => individualIndexResults.nbHits > 0
    )
  ) {
    return children;
  }
  // These indexes trigger the AllResults to re-render and check other indexes
  return noResultsDisplay;
});

// Adds a 'see more' button to the end of a hits component. Used for switching to tabs from the federated overview search.
function SeeMoreWrapper({onClick, resourceType, children}) {
  const Wrapper = connectStateResults(
    ({searchState, searchResults, children}) => {
      if (searchResults && searchResults.nbHits !== 0) {
        return (
          <>
            {children}
            <div className="seach-page-see-more-container">
              <button onClick={onClick} className="search-page-see-more-button">
                ...see more {resourceType.toLowerCase()}
              </button>
            </div>
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
      <SeeMoreWrapper
        onClick={() => setTab(tabName)}
        resourceType={resourceType}
      >
        <Configure hitsPerPage={3} />
        {children}
      </SeeMoreWrapper>
    </Index>
  );
}

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
  <Hits
    hitComponent={({hit}) => {
      hit.id = hit.objectID;
      return <GenericListItem result={hit} />;
    }}
  />
);

const OverviewResults = ({setTab}) => (
  <>
    <AllResults>
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
    </AllResults>
  </>
);

const UsersResults = () => (
  <IndexResults>
    <Hits hitComponent={({hit}) => <GenericListItem result={hit} />} />
  </IndexResults>
);

const GroupsResults = () => (
  <IndexResults>
    <Hits
      hitComponent={({hit}) => {
        hit.id = hit.objectID;
        return <GenericListItem result={hit} />;
      }}
    />
  </IndexResults>
);

const PostsResults = () => (
  <IndexResults>
    <Hits
      hitComponent={({hit}) => {
        hit.id = hit.objectID;
        return <GenericListItem result={hit} />;
      }}
    />
  </IndexResults>
);

const TopicsResults = () => {
  return (
    <IndexResults>
      <TopicHitsComponent />
    </IndexResults>
  );
};

const urlToSearchState = (location) => qs.parse(location.search.slice(1));

const tabToIndex = (tab) => {
  return `${abbrEnv}_${tab.toUpperCase()}`;
};

const TryAnotherSearch = () => {
  return (
    <div className="search-page-try-another-search">
      <SearchBar bigSearchPrompt>
        <p className="search-page-search-prompt-label">Try another search</p>
      </SearchBar>
    </div>
  );
};
