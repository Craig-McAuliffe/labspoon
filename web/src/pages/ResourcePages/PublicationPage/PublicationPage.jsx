import React from 'react';
import {Link} from 'react-router-dom';

import publications from '../../../mockdata/publications';
import journals from '../../../mockdata/journals';
import {useParams} from 'react-router-dom';
import FeedItemTopics from '../../../components/FeedItems/FeedItemTopics';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import publicationPageFeedData from './PublicationPageFeedData';
import PublicationSider from './PublicationPageSider';

import Sider from '../../../components/Layout/Sider/Sider';

import './PublicationPage.css';

export default function PublicationPage({}) {
  const thisPublicationID = useParams().id;
  const matchedPublication = publications().filter((publication) =>
    publication.id.includes(thisPublicationID)
  )[0];

  const search = false;

  const siderTitleChoice = [
    'Other Publications from your Search',
    'Similar Publications to this one',
  ];

  const publicationDetails = () => {
    const detectJournal = () => {
      const journalName = journals.filter((journal) =>
        matchedPublication.url
          .toLowerCase()
          .includes(journal.name.toLowerCase())
      );
      return journalName;
    };
    return (
      <>
        <div className="publication-meta">
          {detectJournal().length === 0 ? (
            <div></div>
          ) : (
            <img
              className="publication-journal-logo"
              src={detectJournal()[0].logo}
              alt={`${detectJournal()[0].name} journal logo`}
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
        <Link to={`/profile/${author.id}`}>{author.name}</Link>
      </h3>
    ));

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
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
            id: 'cites',
            name: 'Cites',
          },
        },
        {
          enabled: false,
          data: {
            id: 'citedBy',
            name: 'Cited By',
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

  return (
    <>
      <div className="sider-layout">
        <Sider>
          <div className="resource-sider">
            <h3 className="resource-sider-title">
              {search ? siderTitleChoice[0] : siderTitleChoice[1]}
            </h3>
            <div className="suggested-resources-container">
              <PublicationSider currentPublication={matchedPublication} />
            </div>
          </div>
        </Sider>
      </div>
      <div className="content-layout">
        <div className="details-container">{publicationDetails()}</div>

        <FilterableResults
          fetchResults={publicationPageFeedData}
          defaultFilter={relationshipFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
          resourceID={thisPublicationID}
        />
      </div>
    </>
  );
}