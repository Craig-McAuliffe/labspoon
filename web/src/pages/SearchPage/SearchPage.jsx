// custom search logic removed after 9ebf31106b04400309e7266010aca27f9ae96342
// in favour of algolia
import React, {useState} from 'react';
import {InstantSearch, SearchBox, Hits, Index} from 'react-instantsearch-dom';

import {searchClient} from '../../algolia';

import {dbPublicationToJSPublication} from '../../helpers/publications';

import {GenericListItem} from '../../components/Results/Results';

import 'instantsearch.css/themes/algolia.css';

import './SearchPage.css';

const PUBLICATIONS = 'Publications';
const POSTS = 'Posts';
const USERS = 'Users';
const GROUPS = 'Groups';
const TOPICS = 'Topics';

const abbrEnv = 'dev';

export default function SearchPage() {
  const [tab, setTab] = useState('publications');

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
          <div className="feed-tabs-container">
            <div className="feed-tabs-layout">{tabs}</div>
          </div>
          <InstantSearch
            searchClient={searchClient}
            indexName={abbrEnv + '_USERS'}
          >
            <SearchBox />
            {tab === PUBLICATIONS ? (
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
