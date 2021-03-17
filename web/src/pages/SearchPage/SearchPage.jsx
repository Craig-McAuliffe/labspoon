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
import {abbrEnv, reCaptchaSiteKey} from '../../config';
import {searchClient} from '../../algolia';
import {createURL} from '../../helpers/search';
import Results, {GenericListItem} from '../../components/Results/Results';
import 'instantsearch.css/themes/algolia.css';
import {useContext} from 'react';
import SearchBar from '../../components/SearchBar';
import LatestPosts from '../../components/Posts/LatestPosts/LatestPosts';
import reCaptcha from '../../helpers/activity';
import useScript from '../../helpers/useScript';
import useDomRemover from '../../helpers/useDomRemover';
import ManualRecaptcha from '../../components/Recaptcha/ManualRecaptcha';
import {TOPIC} from '../../helpers/resourceTypeDefinitions';
import {UnpaddedPageContainer} from '../../components/Layout/Content';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {searchMicrosoftTopics} from '../../components/Topics/SearchMSFields';

import './SearchPage.css';

const OVERVIEW = 'Overview';
const POSTS = 'Posts';
const USERS = 'Users';
const GROUPS = 'Groups';
const TOPICS_TAB_NAME = 'Topics';

const urlToTabsMap = new Map([
  ['overview', OVERVIEW],
  ['posts', POSTS],
  ['users', USERS],
  ['groups', GROUPS],
  ['topics', TOPICS_TAB_NAME],
]);

const tabsToURLMap = new Map([
  [OVERVIEW, 'overview'],
  [POSTS, 'posts'],
  [USERS, 'users'],
  [GROUPS, 'groups'],
  [TOPICS_TAB_NAME, 'topics'],
]);

const TOPIC_SEARCH_LIMIT = 15;
const SearchPageActiveTabContext = React.createContext();

export default function SearchPage() {
  const location = useLocation();
  const [tab, setTab] = useState(OVERVIEW);
  const [searchState, setSearchState] = useState(urlToSearchState(location));
  const [isBot, setIsBot] = useState(false);
  const [topicsResults, setTopicsResults] = useState([]);
  const [shouldResetTopics, setShouldResetTopics] = useState(false);
  const history = useHistory();

  useEffect(() => {
    setTopicsResults([]);
    setShouldResetTopics(true);
  }, [searchState]);

  useScript(
    `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`
  );
  useDomRemover('.grecaptcha-badge');

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
    const changeTab = () =>
      history.push(`/search/${tabPath}/${searchURLParams}`);
    reCaptcha(0.5, 'navigate_search_tabs', changeTab(), () => setIsBot(true));
  }

  useEffect(() => {
    const nextSearchState = urlToSearchState(location);
    if (JSON.stringify(searchState) !== JSON.stringify(nextSearchState)) {
      setSearchState(nextSearchState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const tabs = [OVERVIEW, POSTS, USERS, GROUPS, TOPICS_TAB_NAME].map(
    (tabName) => (
      <button
        onClick={() => updateTab(tabName)}
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
      results = (
        <OverviewResults
          setTab={updateTab}
          query={searchState ? searchState.query : undefined}
          topicsResults={topicsResults}
          setTopicsResults={setTopicsResults}
          shouldResetTopics={shouldResetTopics}
          setShouldResetTopics={setShouldResetTopics}
        />
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
    default:
      break;
  }
  if (isBot) return <ManualRecaptcha successFunction={() => setIsBot(false)} />;

  const tabsDisplay = (
    <div className="feed-tabs-container">
      <div className="feed-tabs-layout">{tabs}</div>
    </div>
  );
  let pageContent = (
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
      {tabsDisplay}
      {searchState.query ? results : <></>}
    </InstantSearch>
  );
  if (tab === TOPICS_TAB_NAME)
    pageContent = (
      <>
        {tabsDisplay}
        {searchState.query ? (
          <TopicsSearchAndResults
            query={searchState.query}
            topicsResults={topicsResults}
            setTopicsResults={setTopicsResults}
          />
        ) : (
          <></>
        )}
      </>
    );
  return (
    <SearchPageActiveTabContext.Provider
      value={{
        activeTab: tab,
        setActiveTab: updateTab,
      }}
    >
      {' '}
      <UnpaddedPageContainer>
        <div className="search-page-search-container">{pageContent}</div>
      </UnpaddedPageContainer>
    </SearchPageActiveTabContext.Provider>
  );
}

const IndexResults = connectStateResults(
  ({searchState, searchResults, children}) => {
    const {activeTab} = useContext(SearchPageActiveTabContext);
    if (searchResults && searchResults.nbHits !== 0) {
      return children;
    }
    if (activeTab === 'Overview') return null;
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

const AllResults = connectStateResults(
  ({
    allSearchResults,
    query,
    topicsResults,
    setTopicsResults,
    children,
    shouldResetTopics,
    setShouldResetTopics,
  }) => {
    const hasResults =
      allSearchResults &&
      Object.values(allSearchResults).some(
        (individualIndexResults) => individualIndexResults.nbHits > 0
      );
    return hasResults ? (
      children
    ) : (
      // These indexes trigger the AllResults to re-render and check other indexes
      <>
        <Index indexName={`${abbrEnv}_POSTS`} />
        <Index indexName={`${abbrEnv}_USERS`} />
        <Index indexName={`${abbrEnv}_GROUPS`} />
        <div className="search-page-no-results-message">
          Hmm, looks like there&#39;s no content on Labspoon that matches your
          search.
        </div>
        {topicsResults.length > 0 && (
          <h3 className="search-page-no-results-topics-title">
            Follow topics for future updates:
          </h3>
        )}
        <TopicsSearchAndResults
          query={query}
          topicsResults={topicsResults}
          setTopicsResults={setTopicsResults}
          overview={true}
          shouldResetTopics={shouldResetTopics}
          setShouldResetTopics={setShouldResetTopics}
        />
        <LatestPosts />
        <TryAnotherSearch />
      </>
    );
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
        <Configure hitsPerPage={4} />
        {children}
      </SeeMoreWrapper>
    </Index>
  );
}

const OverviewResults = ({
  setTab,
  query,
  topicsResults,
  setTopicsResults,
  shouldResetTopics,
  setShouldResetTopics,
}) => (
  <>
    <AllResults
      query={query}
      topicsResults={topicsResults}
      setTopicsResults={setTopicsResults}
      shouldResetTopics={shouldResetTopics}
      setShouldResetTopics={setShouldResetTopics}
    >
      <OverviewResultsSection
        setTab={setTab}
        indexSuffix={'_POSTS'}
        tabName={POSTS}
        resourceType={'Posts'}
      >
        <PostsResults />
      </OverviewResultsSection>
      <OverviewResultsSection
        setTab={setTab}
        indexSuffix={'_USERS'}
        tabName={USERS}
        resourceType={'Users'}
      >
        <UsersResults />
      </OverviewResultsSection>
      <OverviewResultsSection
        setTab={setTab}
        indexSuffix={'_GROUPS'}
        tabName={GROUPS}
        resourceType={'Groups'}
      >
        <GroupsResults />
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

function TopicsSearchAndResults({
  query,
  topicsResults,
  setTopicsResults,
  overview,
  shouldResetTopics,
  setShouldResetTopics,
}) {
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (overview) setHasMore(false);
  }, [overview]);

  const addResourceTypeThenSetTopics = (topics) => {
    setTopicsResults((currentTopics) => [
      ...currentTopics,
      ...topics
        .map((topic) => {
          topic.resourceType = TOPIC;
          return topic;
        })
        .slice(0, TOPIC_SEARCH_LIMIT),
    ]);
    if (topics.length <= TOPIC_SEARCH_LIMIT) setHasMore(false);
    setSkip((currentSkip) => currentSkip + TOPIC_SEARCH_LIMIT);
  };

  useEffect(() => {
    if (query.length === 0) return;
    // already results from tab change
    if (topicsResults.length > 0 && !shouldResetTopics) return;
    setShouldResetTopics(false);
    return fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchTopics = () =>
    searchMicrosoftTopics(
      query,
      setLoading,
      addResourceTypeThenSetTopics,
      TOPIC_SEARCH_LIMIT + 1,
      0,
      skip
    );

  return (
    <>
      <Results
        results={overview ? topicsResults.slice(0, 8) : topicsResults}
        hasMore={hasMore}
        fetchMore={fetchTopics}
        customEndMessage={overview ? ' ' : null}
      />
      {loading && <LoadingSpinner />}
    </>
  );
}
const urlToSearchState = (location) => qs.parse(location.search.slice(1));

const tabToIndex = (tab) => {
  if (tab === 'Overview') return `${abbrEnv}_POSTS`;
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
