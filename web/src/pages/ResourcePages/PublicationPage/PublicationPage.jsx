import React, {useContext, useEffect, useState} from 'react';
import {FeatureFlags} from '../../../App';
import {Link, useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {dbPublicationToJSPublication} from '../../../helpers/publications';

import publications from '../../../mockdata/publications';
import FeedItemTopics from '../../../components/FeedItems/FeedItemTopics';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import publicationPageFeedData from './PublicationPageFeedData';
import PublicationSider from './PublicationPageSider';
import detectJournal from '../../../components/Publication/DetectJournal';

import './PublicationPage.css';

function fetchPublicationDetailsFromDB(publicationID) {
  return db
    .doc(`publications/${publicationID}`)
    .get()
    .then((doc) => dbPublicationToJSPublication(doc.data()))
    .catch((err) => console.log(err));
}

export default function PublicationPage({}) {
  const featureFlags = useContext(FeatureFlags);
  const [publicationID, setPublicationID] = useState(undefined);
  const [publicationDetails, setPublicationDetails] = useState(undefined);

  const publicationIDParam = useParams().publicationID;
  if (publicationID !== publicationIDParam) {
    setPublicationID(publicationIDParam);
  }

  let fetchPublicationDetails;
  if (featureFlags.has('cloud-firestore')) {
    fetchPublicationDetails = () =>
      fetchPublicationDetailsFromDB(publicationID);
  } else {
    fetchPublicationDetails = () =>
      publications().filter((publication) =>
        publication.id.includes(publicationID)
      )[0];
  }

  useEffect(() => {
    Promise.resolve(fetchPublicationDetails())
      .then((newPublicationDetails) => {
        setPublicationDetails(newPublicationDetails);
      })
      .catch((err) => console.log(err));
  }, [publicationID]);

  let fetchFeedData;
  if (featureFlags.has('cloud-firestore')) {
    fetchFeedData = () => [];
  } else {
    fetchFeedData = (skip, limit, filterOptions) =>
      publicationPageFeedData(
        skip,
        limit,
        filterOptions,
        fetchPublicationDetails()
      );
  }

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
      {featureFlags.has('related-resources') ? (
        <SuggestedPublications publicationDetails={publicationDetails} />
      ) : (
        <></>
      )}
      <div className="content-layout">
        <div className="details-container">
          <PublicationDetails publicationDetails={publicationDetails} />
        </div>
        <FilterableResults
          fetchResults={fetchFeedData}
          getDefaultFilter={getDefaultFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
        />
      </div>
    </>
  );
}

function SuggestedPublications({publicationDetails}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">
          Similar Publications to this one
        </h3>
        <div className="suggested-resources-container">
          <PublicationSider currentPublication={publicationDetails} />
        </div>
      </div>
    </div>
  );
}

const PublicationDetails = ({publicationDetails}) => {
  if (publicationDetails === undefined) return <></>;
  return (
    <>
      <div className="publication-meta">
        {detectJournal(publicationDetails).length === 0 ? (
          <div></div>
        ) : (
          <img
            className="publication-journal-logo"
            src={detectJournal(publicationDetails)[0].logo}
            alt={`${detectJournal(publicationDetails)[0].name} journal logo`}
          />
        )}
        <PublicationLink publicationUrl={publicationDetails.url} />
      </div>
      <PublicationBody publicationDetails={publicationDetails} />
    </>
  );
};

function PublicationBody({publicationDetails}) {
  if (publicationDetails === undefined) return <></>;
  return (
    <div className="publication-body">
      <h2>{publicationDetails.title}</h2>
      <PublicationAuthors
        publicationAuthors={publicationDetails.content.authors}
      />
      <h3 className="publication-section-title">Abstract</h3>
      <p className="publication-body-abstract">
        {publicationDetails.content.abstract}
      </p>
      <FeedItemTopics taggedItem={publicationDetails} />
    </div>
  );
}

function PublicationLink({publicationURL}) {
  if (!publicationURL) return <></>;
  return (
    <a href={publicationURL} target="_blank" rel="noreferrer">
      Go to full article
    </a>
  );
}

function PublicationAuthors({publicationAuthors}) {
  return publicationAuthors.map((author) => (
    <h3 className="publication-body-authors" key={author.id}>
      <Link to={`/user/${author.id}`}>{author.name}</Link>
    </h3>
  ));
}
