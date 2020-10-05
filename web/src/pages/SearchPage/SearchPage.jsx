// custom search logic removed after 9ebf31106b04400309e7266010aca27f9ae96342
// in favour of algolia
import React, {useState, useEffect} from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import qs from 'qs';
import {InstantSearch, SearchBox, Hits, Index} from 'react-instantsearch-dom';

import {searchClient} from '../../algolia';
import {searchStateToURL, createURL} from '../../helpers/search';

import Results, {GenericListItem} from '../../components/Results/Results';

import {dbPublicationToJSPublication} from '../../helpers/publications';

import 'instantsearch.css/themes/algolia.css';

import './SearchPage.css';
import {functions} from 'firebase';
import {useContext} from 'react';
import {FeatureFlags} from '../../App';

const PUBLICATIONS = 'Publications';
const POSTS = 'Posts';
const USERS = 'Users';
const GROUPS = 'Groups';
const TOPICS = 'Topics';

const abbrEnv = 'dev';

const DEBOUNCE_TIME = 700;

export default function SearchPage() {
  const location = useLocation();
  const history = useHistory();
  const [tab, setTab] = useState(PUBLICATIONS);
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

  const tabs = [PUBLICATIONS, POSTS, USERS, GROUPS, TOPICS].map((tabName) => (
    <button
      onClick={() => setTab(tabName)}
      key={tabName}
      className={tabName === tab ? 'feed-tab-active' : 'feed-tab'}
    >
      <h3>{tabName}</h3>
    </button>
  ));

  return (
    <>
      <div className="content-layout">
        <div className="feed-container">
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
            {tab === PUBLICATIONS &&
            fflags.has('microsoft-academic-knowledge-api-publications') ? (
              <MicrosoftAcademicKnowledgeAPIPublicationResults
                query={searchState.query}
              />
            ) : (
              <></>
            )}
            {tab === PUBLICATIONS &&
            !fflags.has('microsoft-academic-knowledge-api-publications') ? (
              <Index indexName={abbrEnv + '_PUBLICATIONS'}>
                <Hits
                  hitComponent={({hit}) => (
                    <GenericListItem
                      result={dbPublicationToJSPublication(hit)}
                    />
                  )}
                />
              </Index>
            ) : (
              <></>
            )}
            {tab === POSTS ? (
              <Index indexName={abbrEnv + '_POSTS'}>
                <Hits
                  hitComponent={({hit}) => <GenericListItem result={hit} />}
                />
              </Index>
            ) : (
              <></>
            )}
            {tab === USERS ? (
              <Index indexName={abbrEnv + '_USERS'}>
                <Hits
                  hitComponent={({hit}) => <GenericListItem result={hit} />}
                />
              </Index>
            ) : (
              <></>
            )}
            {tab === GROUPS ? (
              <Index indexName={abbrEnv + '_GROUPS'}>
                <Hits
                  hitComponent={({hit}) => {
                    hit.id = hit.objectID;
                    return <GenericListItem result={hit} />;
                  }}
                />
              </Index>
            ) : (
              <></>
            )}
            {tab === TOPICS ? (
              <Index indexName={abbrEnv + '_TOPICS'}>
                <Hits
                  hitComponent={({hit}) => <GenericListItem result={hit} />}
                />
              </Index>
            ) : (
              <></>
            )}
          </InstantSearch>
        </div>
      </div>
    </>
  );
}

const urlToSearchState = (location) => qs.parse(location.search.slice(1));

const getMicrosoftAcademicKnowledgeAPIPublications = functions().httpsCallable(
  'publications-microsoftAcademicKnowledgePublicationSearch'
);

function MicrosoftAcademicKnowledgeAPIPublicationResults({query}) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (!query) return;
    const apiCallTimeout = setTimeout(
      () =>
        getMicrosoftAcademicKnowledgeAPIPublications({
          query: query,
        }).then((res) => setResults(res.data.map(toLocalPublication))),
      2000
    );
    return () => clearTimeout(apiCallTimeout);
  }, [query]);
  return <Results results={results} hasMore={false} />;
}

function toLocalPublication(remotePublication) {
  remotePublication.resourceType = 'publication';
  return remotePublication;
}
