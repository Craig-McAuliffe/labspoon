import React from 'react';
import {Link, useParams} from 'react-router-dom';

import publications from '../../../mockdata/publications';
import FeedItemTopics from '../../../components/FeedItems/FeedItemTopics';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import publicationPageFeedData from './PublicationPageFeedData';
import PublicationSider from './PublicationPageSider';
import detectJournal from '../../../components/Publication/DetectJournal';

import './PublicationPage.css';

export default function PublicationPage({}) {
  const thisPublicationID = useParams().publicationID;
  const matchedPublication = publications().filter((publication) =>
    publication.id.includes(thisPublicationID)
  )[0];

  const search = false;

  const fetchResults = (skip, limit, filterOptions) =>
    publicationPageFeedData(skip, limit, filterOptions, matchedPublication);

  const siderTitleChoice = [
    'Other Publications from your Search',
    'Similar Publications to this one',
  ];

  const publicationDetails = () => {
    return (
      <>
        <div className="publication-meta">
          {detectJournal(matchedPublication).length === 0 ? (
            <div></div>
          ) : (
            <img
              className="publication-journal-logo"
              src={detectJournal(matchedPublication)[0].logo}
              alt={`${detectJournal(matchedPublication)[0].name} journal logo`}
            />
          )}
          <PublicationLink publicationUrl={matchedPublication.url} />
        </div>
        <div className="publication-body">
          <h2>{matchedPublication.title}</h2>
          <PublicationAuthors
            publicationAuthors={matchedPublication.content.authors}
          />
          <h3 className="publication-section-title">Abstract</h3>
          <p className="publication-body-abstract">
            {matchedPublication.content.abstract}
          </p>
          <FeedItemTopics taggedItem={matchedPublication} />
        </div>
      </>
    );
  };
  const PublicationLink = ({publicationUrl}) =>
    publicationUrl ? (
      <a href={publicationUrl} target="_blank" rel="noreferrer">
        Go to full article
      </a>
    ) : null;

  const PublicationAuthors = ({publicationAuthors}) =>
    publicationAuthors.map((author) => (
      <h3 className="publication-body-authors" key={author.id}>
        <Link to={`/user/${author.id}`}>{author.name}</Link>
      </h3>
    ));

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'similarPublications',
            name: 'Similar Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'relatedPosts',
            name: 'Related Posts',
          },
        },
        {
          enabled: false,
          data: {
            id: 'citesPublications',
            name: 'Cites Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'citedByPublications',
            name: 'Cited By Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'relatedUsers',
            name: 'Related Users',
          },
        },
        {
          enabled: false,
          data: {
            id: 'relatedGroups',
            name: 'Related Groups',
          },
        },
      ],

      mutable: false,
    },
  ];

  const getDefaultFilter = () => relationshipFilter;

  return (
    <>
      <div className="sider-layout">
        <div className="resource-sider">
          <h3 className="resource-sider-title">
            {search ? siderTitleChoice[0] : siderTitleChoice[1]}
          </h3>
          <div className="suggested-resources-container">
            <PublicationSider currentPublication={matchedPublication} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        <div className="details-container">{publicationDetails()}</div>

        <FilterableResults
          fetchResults={fetchResults}
          getDefaultFilter={getDefaultFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
        />
      </div>
    </>
  );
}
