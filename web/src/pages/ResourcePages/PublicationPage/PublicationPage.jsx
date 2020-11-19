import React, {useContext, useEffect, useState} from 'react';
import {FeatureFlags} from '../../../App';
import {Link, useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {dbPublicationToJSPublication} from '../../../helpers/publications';

import ListItemTopics from '../../../components/CommonListItemParts/ListItemTopics';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  FilterManager,
  NewFilterMenuWrapper,
} from '../../../components/FilterableResults/FilterableResults';
import PublicationSider from './PublicationPageSider';
import SuggestedContentSider from '../../../components/SuggestedContentSider/SuggestedContentSider';

import './PublicationPage.css';
import {getActiveTabID} from '../../../helpers/filters';
import MAGRouterDisplay from '../../../components/MAGRouter';

// If the user clicks on a search result from Microsoft we redirect them to the corresponding Labspoon publication.
export function MAGPublicationRouter() {
  const magPublicationID = useParams().magPublicationID;
  return (
    <MAGRouterDisplay
      query={db
        .collection('publications')
        .where('microsoftID', '==', magPublicationID)
        .limit(1)}
      formatRedirectPath={(id) => `/publication/${id}`}
    />
  );
}

function fetchPublicationDetailsFromDB(publicationID) {
  return db
    .doc(`publications/${publicationID}`)
    .get()
    .then((doc) => {
      return dbPublicationToJSPublication(doc.data());
    })
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

  useEffect(() => {
    Promise.resolve(fetchPublicationDetailsFromDB(publicationID))
      .then((newPublicationDetails) => {
        setPublicationDetails(newPublicationDetails);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationID]);

  const fetchFeedData = (_, limit, filterOptions, last) =>
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
        <PublicationsFromSearch publicationDetails={publicationDetails} />
      ) : (
        <div></div>
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
      <SuggestedContentSider
        resourceType={
          publicationDetails ? `${publicationDetails.resourceType}` : undefined
        }
        resourceID={publicationDetails ? `${publicationDetails.id}` : undefined}
      />
    </>
  );
}

function PublicationsFromSearch({publicationDetails}) {
  return (
    <div className="sider-layout">
      <div className="resource-sider">
        <h3 className="resource-sider-title">
          Other publications from previous page
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
    <div className="publication-body">
      <h2>{publicationDetails.title}</h2>
      <PublicationSources sources={publicationDetails.sources} />
      {publicationDetails.content.authors ? (
        <PublicationAuthors
          publicationAuthors={publicationDetails.content.authors}
        />
      ) : (
        <></>
      )}
      <PublicationBodyAbstract abstract={publicationDetails.abstract} />
      <ListItemTopics dbTopics={publicationDetails.topics} />
    </div>
  );
};

function PublicationBodyAbstract({abstract}) {
  if (!abstract) return <></>;
  return (
    <>
      <h3 className="publication-section-title">Abstract</h3>
      <p className="publication-body-abstract">{abstract}</p>
    </>
  );
}

function PublicationSources({sources}) {
  const [showMore, setShowMore] = useState(false);
  if (!sources || sources.length === 0) return <></>;
  const links = sources.map((source, idx) => (
    <p key={source.url}>
      {source.type.toUpperCase()}&nbsp;
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        {source.url}
      </a>
      {idx === 0 ? (
        <button
          type="button"
          onClick={() => setShowMore((showMore) => !showMore)}
        >
          See {showMore ? 'fewer' : 'more'} links
        </button>
      ) : (
        <></>
      )}
    </p>
  ));
  if (!showMore) return links[0];
  return links;
}

function PublicationAuthors({publicationAuthors}) {
  if (!publicationAuthors) return <></>;
  return publicationAuthors.map((author) => (
    <h3 className="publication-body-authors" key={author.name}>
      {author.id ? (
        <Link to={`/user/${author.id}`}>{author.name}</Link>
      ) : (
        author.name
      )}
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
      return [
        getPaginatedPostsFromCollectionRef(relatedPostsDBRef, limit, last),
        null,
      ];
    default:
      return [[], null];
  }
}
