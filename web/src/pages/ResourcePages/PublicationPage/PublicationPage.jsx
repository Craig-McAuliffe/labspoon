import React, {useContext, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import {FeatureFlags} from '../../../App';
import {db} from '../../../firebase';
import {useParams} from 'react-router-dom';

import {
  dbPublicationToJSPublication,
  getLinkForAuthor,
  getPaginatedPublicationsFromCollectionRef,
} from '../../../helpers/publications';

import ListItemTopics from '../../../components/CommonListItemParts/ListItemTopics';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  FilterManager,
  NewFilterMenuWrapper,
  FilterableResultsContext,
} from '../../../components/FilterableResults/FilterableResults';
import PublicationSider from './PublicationPageSider';
import SuggestedContentSider from '../../../components/SuggestedContentSider/SuggestedContentSider';
import {getActiveTabID} from '../../../helpers/filters';
import MAGRouterDisplay from '../../../components/MAGRouter';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import {
  DropDownTriangle,
  InvertedDropDownTriangle,
} from '../../../assets/GeneralActionIcons';

import './PublicationPage.css';

const REFERENCES_TAB = 'references';

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

  if (featureFlags.has('publication-references')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: REFERENCES_TAB,
        name: 'References',
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
            <RetrieveMoreReferences
              publicationID={publicationID}
              publication={publicationDetails}
            />
            <NewResultsWrapper />
          </div>
        </FilterableResults>
      </div>
      <SuggestedContentSider
        resourceType={'publication'}
        resourceID={publicationID}
      />
    </>
  );
}

const retrieveReferences = firebase
  .functions()
  .httpsCallable('publications-retrieveReferencesFromMicrosoft');

function RetrieveMoreReferences({publicationID, publication}) {
  const filterableResults = useContext(FilterableResultsContext);
  const [clicked, setClicked] = useState(false);
  if (!filterableResults.filter || filterableResults.filter.length === 0)
    return <></>;
  const enabledTabID = getActiveTabID(filterableResults.filter);
  if (enabledTabID !== REFERENCES_TAB) return <></>;

  if (
    !publication.referencedPublicationMicrosoftIDs ||
    publication.referencedPublicationMicrosoftIDs.length === 0
  )
    return <></>;

  function retrieveReferencesForPublication() {
    setClicked(true);
    retrieveReferences({publicationID: publicationID});
  }

  return (
    <div className="publication-references-info-container">
      <h3 className="publication-references-info">
        There are...{' '}
        <button onClick={() => retrieveReferencesForPublication()}>
          {publication.referencedPublicationMicrosoftIDs.length} additional
          referenced publications.
        </button>
      </h3>
      <div className="publication-references-retrieval-container">
        <p>Add them to Labspoon:</p>
        <PrimaryButton
          inactive={clicked}
          submit={false}
          onClick={retrieveReferencesForPublication}
        >
          Retrieve
        </PrimaryButton>
        {clicked ? (
          <p className="publication-references-fetching-message">
            We are fetching those references for you, it just takes a little
            while. Try reloading the page in about 10 seconds.
          </p>
        ) : (
          <></>
        )}
      </div>
    </div>
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
      <h2 className="publication-page-title">{publicationDetails.title}</h2>
      <PublicationSources sources={publicationDetails.sources} />
      <div>
        {publicationDetails.content.authors ? (
          <PublicationAuthors
            publicationAuthors={publicationDetails.content.authors}
          />
        ) : null}
      </div>
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
  const linkTypeLanguage = (sourceType) => {
    switch (sourceType) {
      case 'doc' || 'pdf' || 'ppt' || 'xls' || 'ps':
        return 'Download';
      case 'html':
        return 'Go to';
      case 'text':
        return 'View';
      default:
        return 'View';
    }
  };
  const [showMore, setShowMore] = useState(false);
  if (!sources || sources.length === 0) return <></>;
  const genericLink = (source) => (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="publication-page-source-link"
    >
      {linkTypeLanguage(source.type)} {source.type}&nbsp;
    </a>
  );
  return (
    <>
      <div className="publication-page-source-container">
        {genericLink(sources[0])}
        {sources.length > 1 ? (
          <button
            type="button"
            onClick={() => setShowMore((showMore) => !showMore)}
            className="publication-page-source-options-button"
          >
            Other viewing options{' '}
            {showMore ? <InvertedDropDownTriangle /> : <DropDownTriangle />}
          </button>
        ) : null}
      </div>
      {showMore ? (
        <div className="publication-page-source-extra-options-container">
          {sources.slice(1).map((source) => (
            <span
              className="publication-page-source-extra-option"
              key={source.url}
            >
              {genericLink(source)}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}

function PublicationAuthors({publicationAuthors}) {
  if (!publicationAuthors) return <></>;
  return publicationAuthors.map((author) => {
    const authorLink = getLinkForAuthor(
      author.id,
      author.microsoftID,
      author.name
    );
    return (
      <h3 className="publication-body-authors" key={author.name}>
        {authorLink}
      </h3>
    );
  });
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
    case REFERENCES_TAB:
      const referencesCollection = db.collection(
        `publications/${publicationID}/references`
      );
      return [
        getPaginatedPublicationsFromCollectionRef(
          referencesCollection,
          limit,
          last
        ),
        null,
      ];
    default:
      return [[], null];
  }
}
