import React, {useContext, useEffect, useState} from 'react';
import {FeatureFlags} from '../../../App';
import {Link, Redirect, useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {dbPublicationToJSPublication} from '../../../helpers/publications';

import publications from '../../../mockdata/publications';
import ListItemTopics from '../../../components/CommonListItemParts/ListItemTopics';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  FilterManager,
  NewFilterMenuWrapper,
} from '../../../components/FilterableResults/FilterableResults';
import PublicationSider from './PublicationPageSider';
import detectJournal from '../../../components/Publication/DetectJournal';

import './PublicationPage.css';
import {getActiveTabID} from '../../../helpers/filters';

// If the user clicks on a search result from Microsoft we redirect them to the corresponding Labspoon publication.
export function MAGPublicationRouter() {
  const magPublicationID = useParams().magPublicationID;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [publicationID, setPublicationID] = useState();

  useEffect(() => {
    db.collection('publications')
      .where('microsoftID', '==', magPublicationID)
      .limit(1)
      .get()
      .then((qs) => {
        setLoading(false);
        if (qs.empty) return setError(true);
        qs.forEach((doc) => {
          console.log(doc.data(), doc.id);
          setPublicationID(doc.id);
        });
      })
      .catch((err) => {
        setLoading(false);
        setError(true);
        console.error(err);
      });
  }, [magPublicationID]);

  if (loading || publicationID === undefined) return <h1>Loading...</h1>;
  if (error)
    return (
      <>
        <h1>Error: Publication not found</h1>
        <p>
          We&rsquo;re probably just indexing this, so try again in a few
          minutes.
        </p>
      </>
    );

  return <Redirect to={`/publication/${publicationID}`} />;
}

function fetchPublicationDetailsFromDB(publicationID) {
  return db
    .doc(`publications/${publicationID}`)
    .get()
    .then((doc) => dbPublicationToJSPublication(doc.data()))
    .catch((err) => console.log(err));
}

export default function PublicationPage() {
  const featureFlags = useContext(FeatureFlags);
  const [publicationID, setPublicationID] = useState(undefined);
  const [publicationDetails, setPublicationDetails] = useState(undefined);

  const publicationIDParam = useParams().publicationID;
  if (publicationID !== publicationIDParam) {
    setPublicationID(publicationIDParam);
  }

  let fetchPublicationDetails;
  if (!featureFlags.has('disable-cloud-firestore')) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationID]);

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchFeedDataFromDB(limit, filterOptions, last, publicationID);

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
      ],
      mutable: false,
    },
  ];

  if (featureFlags.has('publication-similar-publications')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'similarPublications',
        name: 'Similar Publications',
      },
    });
  }
  if (featureFlags.has('publication-cites')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'citesPublications',
        name: 'Cites Publications',
      },
    });
  }
  if (featureFlags.has('publication-cited-by')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'citedByPublications',
        name: 'Cited By Publications',
      },
    });
  }
  if (featureFlags.has('publication-related-users')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'relatedUsers',
        name: 'Related Users',
      },
    });
  }
  if (featureFlags.has('publication-related-groups')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'relatedGroups',
        name: 'Related Groups',
      },
    });
  }

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
        <FilterableResults fetchResults={fetchFeedData} limit={10}>
          <div className="feed-container">
            <FilterManager>
              <ResourceTabs tabs={relationshipFilter} />
              <NewFilterMenuWrapper />
            </FilterManager>
            <NewResultsWrapper />
          </div>
        </FilterableResults>
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
      <PublicationBodyAbstract abstract={publicationDetails.abstract} />
      <ListItemTopics taggedItem={publicationDetails} />
    </div>
  );
}

function PublicationBodyAbstract({abstract}) {
  if (!abstract) return <></>;
  return (
    <>
      <h3 className="publication-section-title">Abstract</h3>
      <p className="publication-body-abstract">{abstract}</p>
    </>
  );
}

function PublicationLink({publicationURL}) {
  if (!publicationURL) return <></>;
  return (
    <a href={publicationURL} target="_blank" rel="noopener noreferrer">
      Go to full article
    </a>
  );
}

function PublicationAuthors({publicationAuthors}) {
  if (!publicationAuthors) return <></>;
  return publicationAuthors.map((author) => (
    <h3 className="publication-body-authors" key={author.id}>
      <Link to={`/user/${author.id}`}>{author.name}</Link>
    </h3>
  ));
}

function fetchFeedDataFromDB(limit, filterOptions, last, publicationID) {
  const activeTab = getActiveTabID(filterOptions);
  switch (activeTab) {
    case 'relatedPosts':
      const relatedPostsDBRef = db.collection(
        `publications/${publicationID}/posts`
      );
      return getPaginatedPostsFromCollectionRef(relatedPostsDBRef, limit, last);
    default:
      return [];
  }
}
