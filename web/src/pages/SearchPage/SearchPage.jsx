import React, {useState, useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import qs from 'qs';
import algoliasearch from 'algoliasearch';
import {abbrEnv, reCaptchaSiteKey} from '../../config';
import Results, {GenericListItem} from '../../components/Results/Results';
import SearchBar from '../../components/SearchBar';
import LatestPosts from '../../components/Posts/LatestPosts/LatestPosts';
import reCaptcha from '../../helpers/activity';
import useScript from '../../helpers/useScript';
import useDomRemover from '../../helpers/useDomRemover';
import ManualRecaptcha from '../../components/Recaptcha/ManualRecaptcha';
import {
  GROUP,
  OPENPOSITION,
  POST,
  TOPIC,
  USER,
} from '../../helpers/resourceTypeDefinitions';
import {UnpaddedPageContainer} from '../../components/Layout/Content';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {searchMicrosoftTopics} from '../../components/Topics/SearchMSFields';

import './SearchPage.css';

const OVERVIEW_TAB_NAME = 'Overview';
const POSTS_TAB_NAME = 'Posts';
const USERS_TAB_NAME = 'Users';
const GROUPS_TAB_NAME = 'Groups';
const TOPICS_TAB_NAME = 'Topics';
const OPEN_POSITIONS_TAB_NAME = 'Open Positions';

const client = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID,
  process.env.REACT_APP_ALGOLIA_ADMIN_KEY
);

const urlToTabsNameMap = new Map([
  ['overview', OVERVIEW_TAB_NAME],
  ['posts', POSTS_TAB_NAME],
  ['users', USERS_TAB_NAME],
  ['groups', GROUPS_TAB_NAME],
  ['topics', TOPICS_TAB_NAME],
  ['openPositions', OPEN_POSITIONS_TAB_NAME],
]);

const tabsToURLMap = new Map([
  [OVERVIEW_TAB_NAME, 'overview'],
  [POSTS_TAB_NAME, 'posts'],
  [USERS_TAB_NAME, 'users'],
  [GROUPS_TAB_NAME, 'groups'],
  [TOPICS_TAB_NAME, 'topics'],
  [OPEN_POSITIONS_TAB_NAME, 'openPositions'],
]);

const indexToResourceType = (index) => {
  if (index === `${abbrEnv}_POSTS`) return POST;
  if (index === `${abbrEnv}_GROUPS`) return GROUP;
  if (index === `${abbrEnv}_USERS`) return USER;
  if (index === `${abbrEnv}_OPENPOSITIONS`) return OPENPOSITION;
};

const TOPIC_SEARCH_LIMIT = 20;
const SEARCH_PAGE_LIMIT = 18;

const RESET_TAB_RESULTS_STATE = {
  [POSTS_TAB_NAME]: [],
  [USERS_TAB_NAME]: [],
  [TOPICS_TAB_NAME]: [],
  [GROUPS_TAB_NAME]: [],
  [OVERVIEW_TAB_NAME]: [],
  [OPEN_POSITIONS_TAB_NAME]: [],
};

const RESET_TAB_PAGE_STATE = {
  [POSTS_TAB_NAME]: 0,
  [USERS_TAB_NAME]: 0,
  [GROUPS_TAB_NAME]: 0,
  [OPEN_POSITIONS_TAB_NAME]: 0,
};

const RESET_TABS_HAS_MORE_STATE = {
  [POSTS_TAB_NAME]: true,
  [USERS_TAB_NAME]: true,
  [GROUPS_TAB_NAME]: true,
  [OPEN_POSITIONS_TAB_NAME]: true,
};

export default function SearchPage() {
  const history = useHistory();
  const location = history.location;
  const tab = useParams().tab
    ? urlToTabsNameMap.get(useParams().tab)
    : OVERVIEW_TAB_NAME;
  const [searchQuery, setSearchQuery] = useState(urlToSearchQuery(location));
  const [isBot, setIsBot] = useState(false);
  const [tabbedResults, setTabbedResults] = useState(RESET_TAB_RESULTS_STATE);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(false);
  const [searchError, setSearchError] = useState(false);
  // recaptcha to prevent scraping
  useScript(
    `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`
  );
  useDomRemover('.grecaptcha-badge');

  // change index for new tab
  useEffect(() => setCurrentIndex(client.initIndex(tabToIndex(tab))), [tab]);
  // reset results and pagination and errors for new search
  useEffect(() => {
    setPage(RESET_TAB_PAGE_STATE);
    setHasMore(RESET_TABS_HAS_MORE_STATE);
    setTabbedResults(RESET_TAB_RESULTS_STATE);
    if (searchError) setSearchError(false);
  }, [searchQuery]);

  // update search state on new location
  useEffect(() => {
    const nextSearchQuery = urlToSearchQuery(location);
    if (JSON.stringify(searchQuery) !== JSON.stringify(nextSearchQuery)) {
      setSearchQuery(nextSearchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (isBot) return <ManualRecaptcha successFunction={() => setIsBot(false)} />;

  let pageContent = (
    <TabbedSearchResults
      hasMore={hasMore}
      setIsLoadingFeed={setIsLoadingFeed}
      tab={tab}
      tabbedResults={tabbedResults}
      setTabbedResults={setTabbedResults}
      currentIndex={currentIndex}
      searchQuery={searchQuery}
      searchError={searchError}
      setHasMore={setHasMore}
      isLoadingFeed={isLoadingFeed}
      page={page}
      setPage={setPage}
    />
  );

  if (tab === OVERVIEW_TAB_NAME)
    pageContent = (
      <OverviewResults
        setTab={updateTab}
        query={searchQuery}
        topicsResults={tabbedResults[TOPICS_TAB_NAME]}
        setTabbedResults={setTabbedResults}
        tab={tab}
        tabbedResults={tabbedResults}
        setSearchError={setSearchError}
        searchError={searchError}
        searchQuery={searchQuery}
        isLoadingFeed={isLoadingFeed}
        setIsLoadingFeed={setIsLoadingFeed}
      />
    );

  if (tab === TOPICS_TAB_NAME)
    pageContent = (
      <TopicsSearchAndResults
        query={searchQuery}
        topicsResults={tabbedResults[TOPICS_TAB_NAME]}
        setTabbedResults={setTabbedResults}
      />
    );
  if (!searchQuery)
    pageContent = (
      <p className="search-page-error-message">
        No search query. Search for something in the search bar above. the
        search button.
      </p>
    );
  return (
    <UnpaddedPageContainer>
      <div className="search-page-search-container">
        <SearchTabs searchQuery={searchQuery} history={history} tab={tab} />
        {searchError && (
          <p className="search-page-error-message">
            Something went wrong with that search.{' '}
            <button onClick={() => window.location.reload()}>
              Try refreshing the page!
            </button>
          </p>
        )}
        {pageContent}
      </div>
    </UnpaddedPageContainer>
  );
}

function SearchTabs({searchQuery, history, tab}) {
  const tabOptions = [
    OVERVIEW_TAB_NAME,
    POSTS_TAB_NAME,
    USERS_TAB_NAME,
    GROUPS_TAB_NAME,
    TOPICS_TAB_NAME,
    OPEN_POSITIONS_TAB_NAME,
  ];
  return (
    <div className="feed-tabs-container">
      <div className="feed-tabs-layout">
        {tabOptions.map((tabName) => (
          <button
            onClick={() => updateTab(tabName, searchQuery, history)}
            key={tabName}
            className={
              tabName === tab ? 'feed-tab-active' : 'feed-tab-inactive'
            }
          >
            <h3>{tabName}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}
// When clicking on a different tab
function updateTab(tab, searchQuery, history) {
  const tabPath = tabsToURLMap.get(tab);
  const changeTab = () =>
    history.push(`/search/${tabPath}/?query=${searchQuery}`);
  reCaptcha(0.5, 'navigate_search_tabs', changeTab(), () => setIsBot(true));
}

function TabbedSearchResults({
  hasMore,
  setIsLoadingFeed,
  tab,
  tabbedResults,
  setTabbedResults,
  currentIndex,
  searchQuery,
  searchError,
  setHasMore,
  isLoadingFeed,
  page,
  setPage,
}) {
  // initial search for the tab. Not overview tab or topics tab.
  // do not do this if there are already results for this tab
  useEffect(async () => {
    if (!currentIndex) return;
    if (tabbedResults[tab].length !== 0) return;

    if (!searchQuery) return;
    if (tabToIndex(tab) !== currentIndex.indexName) return;
    setIsLoadingFeed(true);
    const searchResults = await currentIndex
      .search(searchQuery, {
        hitsPerPage: SEARCH_PAGE_LIMIT + 1,
        page: 0,
      })
      .catch((err) => {
        setIsLoadingFeed(false);
        return console.error(`unable to search algolia ${err}`);
      });
    if (!searchResults) {
      setIsLoadingFeed(false);
      return setSearchError(true);
    }
    if (searchError) setSearchError(false);
    if (searchResults.nbHits === 0) {
      setIsLoadingFeed(false);
      return;
    }
    const formattedResults = searchResults.hits.map((searchResult) => {
      searchResult.id === searchResult.objectID;
      return searchResult;
    });
    if (searchResults.nbHits < SEARCH_PAGE_LIMIT + 1) {
      setHasMore((currentHasMoreState) => {
        const newHasMoreState = {...currentHasMoreState};
        newHasMoreState[tab] = false;
        return newHasMoreState;
      });
      setTabbedResults((currentTabbedResults) => {
        const newTabbedResults = {...currentTabbedResults};
        newTabbedResults[tab] = formattedResults.slice(0, SEARCH_PAGE_LIMIT);
        return newTabbedResults;
      });
    } else
      setTabbedResults((currentTabbedResults) => {
        const newTabbedResults = {...currentTabbedResults};
        newTabbedResults[tab] = formattedResults;
        return newTabbedResults;
      });
    setIsLoadingFeed(false);
  }, [tab, searchQuery, currentIndex]);

  const fetchMore = async () => {
    setIsLoadingFeed(true);
    if (!hasMore) return;
    if (isLoadingFeed) return;
    setIsLoadingFeed(true);
    const searchResults = await currentIndex
      .search(searchQuery, {
        hitsPerPage: SEARCH_PAGE_LIMIT + 1,
        page: page[tab] + 1,
      })
      .catch((err) => {
        setIsLoadingFeed(false);
        return console.error(`unable to search algolia ${err}`);
      });
    if (!searchResults) {
      setIsLoadingFeed(false);
      return setSearchError(true);
    }
    if (searchError) setSearchError(false);
    setPage((currentTabbedPages) => {
      const newTabbedPages = {...currentTabbedPages};
      newTabbedPages[tab] = currentTabbedPages[tab] + 1;
      return newTabbedPages;
    });
    const formattedResults = searchResults.hits.map((searchResult) => {
      searchResult.id === searchResult.objectID;
      return searchResult;
    });
    if (formattedResults.length < SEARCH_PAGE_LIMIT + 1) {
      setHasMore((currentHasMoreState) => {
        const newHasMoreState = {...currentHasMoreState};
        newHasMoreState[tab] = false;
        return newHasMoreState;
      });
      setTabbedResults((currentTabbedResults) => {
        const newTabbedResults = {...currentTabbedResults};
        newTabbedResults[tab] = [
          ...currentTabbedResults[tab],
          ...formattedResults.slice(0, SEARCH_PAGE_LIMIT),
        ];
        return newTabbedResults;
      });
    } else
      setTabbedResults((currentTabbedResults) => {
        const newTabbedResults = {...currentTabbedResults};
        newTabbedResults[tab] = [
          ...currentTabbedResults[tab],
          ...formattedResults,
        ];
        return newTabbedResults;
      });
    setIsLoadingFeed(false);
  };
  if (tabbedResults[tab].length === 0 && !isLoadingFeed && !searchError)
    return (
      <p>
        {`Hmm, we couldn't find any ${tab} for your search '${searchQuery}'. You can
    check the other tabs though!`}
      </p>
    );

  return (
    <Results
      hasMore={hasMore[tab]}
      fetchMore={fetchMore}
      results={tabbedResults[tab]}
      customLoading={isLoadingFeed}
    />
  );
}

// Adds a 'see more' button to the end of a hits component. Used for switching to tabs from the federated overview search.
function SeeMoreWrapper({onClick, resourceType, children}) {
  return (
    <>
      {children}
      <div className="seach-page-see-more-container">
        <button onClick={onClick} className="search-page-see-more-button">
          ...see more {resourceType.toLowerCase()}s
        </button>
      </div>
    </>
  );
}

function OverviewResultsSection({setTab, children, tabName, resourceType}) {
  return (
    <SeeMoreWrapper onClick={() => setTab(tabName)} resourceType={resourceType}>
      {children}
    </SeeMoreWrapper>
  );
}

const OverviewResults = ({
  setTab,
  query,
  topicsResults,
  setTabbedResults,
  tabbedResults,
  setSearchError,
  tab,
  searchError,
  searchQuery,
  isLoadingFeed,
  setIsLoadingFeed,
}) => {
  const overviewPageQueries = [
    {
      indexName: `${abbrEnv}_${POSTS_TAB_NAME.toUpperCase()}`,
      query: searchQuery,
      params: {
        hitsPerPage: 4,
      },
    },
    {
      indexName: `${abbrEnv}_${USERS_TAB_NAME.toUpperCase()}`,
      query: searchQuery,
      params: {
        hitsPerPage: 4,
      },
    },
    {
      indexName: `${abbrEnv}_${GROUPS_TAB_NAME.toUpperCase()}`,
      query: searchQuery,
      params: {
        hitsPerPage: 4,
      },
    },
    {
      indexName: `${abbrEnv}_OPENPOSITIONS`,
      query: searchQuery,
      params: {
        hitsPerPage: 4,
      },
    },
  ];

  useEffect(async () => {
    if (!isLoadingFeed) setIsLoadingFeed(true);
    if (!query) return;
    if (tabbedResults[OVERVIEW_TAB_NAME].length > 0) {
      setIsLoadingFeed(false);
      return;
    }
    const searchResults = await client
      .multipleQueries(overviewPageQueries)
      .catch((err) => {
        setSearchError(true);
        setIsLoadingFeed(false);
        return console.error(
          `unable to search algolia for overview page ${err}`
        );
      });
    if (!searchResults) {
      setIsLoadingFeed(false);
      return;
    }
    if (searchError) setSearchError(false);
    const searchResultsWithHits = searchResults.results.filter(
      (resultsFromIndex) => resultsFromIndex.nbHits > 0
    );
    if (searchResultsWithHits.length === 0) {
      setIsLoadingFeed(false);
      return;
    }
    searchResultsWithHits.forEach((indexSpecificResults) => {
      const formattedHits = indexSpecificResults.hits.map((hit) => {
        hit.id = hit.objectID;
        return hit;
      });
      const resourceType = indexToResourceType(indexSpecificResults.index);
      setTabbedResults((currentTabbedResults) => {
        const newTabbedResults = {...currentTabbedResults};
        newTabbedResults[OVERVIEW_TAB_NAME] = [
          ...currentTabbedResults[OVERVIEW_TAB_NAME],
          {
            hits: formattedHits,
            resourceType: resourceType,
          },
        ];
        return newTabbedResults;
      });
    });
    setIsLoadingFeed(false);
  }, [query, tabbedResults[OVERVIEW_TAB_NAME]]);
  if (isLoadingFeed) return <LoadingSpinner />;
  if (tabbedResults[OVERVIEW_TAB_NAME].length === 0 && !searchError)
    return (
      <>
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
          setTabbedResults={setTabbedResults}
          overview={true}
        />
        <LatestPosts />
        <TryAnotherSearch />
      </>
    );
  return tabbedResults[OVERVIEW_TAB_NAME].map((resultsSection, i) => (
    <OverviewResultsSection
      setTab={setTab}
      tabName={tab}
      resourceType={resultsSection.resourceType}
      key={i}
    >
      {resultsSection.hits.map((hit) => (
        <GenericListItem result={hit} key={hit.id} />
      ))}
    </OverviewResultsSection>
  ));
};
function TopicsSearchAndResults({
  query,
  topicsResults,
  setTabbedResults,
  overview,
}) {
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (overview) setHasMore(false);
  }, [overview]);

  const addResourceTypeThenSetTopics = (fetchedTopics) => {
    const topicsWithResourceType = fetchedTopics.map((fetchedTopic) => {
      fetchedTopic.resourceType = TOPIC;
      return fetchedTopic;
    });
    let processedTopics;
    if (fetchedTopics.length <= TOPIC_SEARCH_LIMIT) {
      setHasMore(false);
      processedTopics = topicsWithResourceType;
    } else
      processedTopics = topicsWithResourceType.slice(0, TOPIC_SEARCH_LIMIT);

    setTabbedResults((currentResults) => {
      const newResults = {...currentResults};
      newResults[TOPICS_TAB_NAME] = [
        ...currentResults[TOPICS_TAB_NAME],
        ...processedTopics,
      ];
      return newResults;
    });
    setSkip((currentSkip) => currentSkip + TOPIC_SEARCH_LIMIT);
  };

  useEffect(() => {
    if (query.length === 0) return;
    // already results from tab change
    if (topicsResults.length > 0) return;
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
const urlToSearchQuery = (location) => {
  const {query} = qs.parse(location.search.slice(1));
  return query;
};

const tabToIndex = (tab) => {
  if (tab === 'Overview') return `${abbrEnv}_POSTS`;
  if (tab === OPEN_POSITIONS_TAB_NAME) return `${abbrEnv}_OPENPOSITIONS`;
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
