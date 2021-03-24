import React, {useContext, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import {AuthContext, FeatureFlags} from '../../../App';
import {db} from '../../../firebase';
import {useParams} from 'react-router-dom';

import {
  dbPublicationToJSPublication,
  getLinkForAuthor,
  getPaginatedPublicationsFromCollectionRef,
  getUniqueAuthorsFromAuthors,
} from '../../../helpers/publications';

import ListItemTopics from '../../../components/ListItem/ListItemTopics';
import {getPaginatedPostsFromCollectionRef} from '../../../helpers/posts';
import {FilterableResultsContext} from '../../../components/FilterableResults/FilterableResults';
import SimilarContentSider from '../../../components/SuggestedContent/SimilarContentSider';
import {getActiveTabID} from '../../../helpers/filters';
import MAGRouterDisplay from '../../../components/MAGRouter';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import {
  DropDownTriangle,
  InvertedDropDownTriangle,
} from '../../../assets/GeneralActionIcons';
import ResourcesFeed from '../ResourcesFeeds';
import {PaddedContent} from '../../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import CreateButton from '../../../components/Buttons/CreateButton';

import './PublicationPage.css';
import CreatePost from '../../../components/Posts/Post/CreatePost/CreatePost';
import {PUBLICATION} from '../../../helpers/resourceTypeDefinitions';
import {publicationDateDisplay} from '../../../components/Publication/PublicationListItem';

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

function fetchPublicationDetailsFromDB(publicationID, setNotFound, setLoading) {
  return db
    .doc(`publications/${publicationID}`)
    .get()
    .then((doc) => {
      setLoading(false);
      if (!doc.exists) {
        setNotFound(true);
        return;
      }
      return dbPublicationToJSPublication(doc.data());
    })
    .catch((err) => {
      setLoading(false);
      console.log(err);
      setNotFound(true);
    });
}

export default function PublicationPage() {
  const featureFlags = useContext(FeatureFlags);
  const [publicationID, setPublicationID] = useState(undefined);
  const [publicationDetails, setPublicationDetails] = useState(undefined);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const publicationIDParam = useParams().publicationID;
  if (publicationID !== publicationIDParam) {
    setPublicationID(publicationIDParam);
  }

  useEffect(() => {
    Promise.resolve(
      fetchPublicationDetailsFromDB(publicationID, setNotFound, setLoading)
    )
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

  relationshipFilter[0].options.push({
    enabled: false,
    data: {
      id: REFERENCES_TAB,
      name: 'References',
    },
  });

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

  if (loading) return <LoadingSpinnerPage />;
  if (notFound) return <NotFoundPage />;

  return (
    <>
      <ResourcesFeed
        fetchResults={fetchFeedData}
        limit={10}
        tabs={relationshipFilter}
        getCustomComponentAboveFeed={() => (
          <QuickCreatePublicationPost
            publication={publicationDetails}
            publicationID={publicationID}
          />
        )}
      >
        <PaddedContent>
          <PublicationDetails publicationDetails={publicationDetails} />
        </PaddedContent>
        <RetrieveMoreReferences
          publicationID={publicationID}
          publication={publicationDetails}
        />
      </ResourcesFeed>
      <SimilarContentSider
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
    retrieveReferences({publicationID: publicationID})
      .catch((err) => {
        console.error(err);
        alert(
          'Something went wrong fetching those references. Please try again or contact help@labspoon.com if the issue persists.'
        );
        setClicked(false);
      })
      .then(() => window.location.reload());
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

function QuickCreatePublicationPost({publication, publicationID}) {
  const [isCreating, setIsCreating] = useState(false);
  const {userProfile} = useContext(AuthContext);
  if (!userProfile) return null;
  if (!isCreating)
    return (
      <div className="publication-page-quick-post-button-container">
        <CreateButton
          text="Create a post about this publication"
          buttonAction={() => setIsCreating(true)}
        />
      </div>
    );

  return (
    <>
      <div className="publication-page-quick-post-cancel-container">
        <button onClick={() => setIsCreating(false)}>
          <h4>Cancel Post</h4>
        </button>
      </div>
      <CreatePost
        preTaggedResourceType={PUBLICATION}
        preTaggedResourceID={publicationID}
        preTaggedResourceDetails={publication}
        onSuccess={() => setIsCreating(false)}
        keepExpanded={true}
      />
    </>
  );
}

const PublicationDetails = ({publicationDetails}) => {
  if (publicationDetails === undefined) return <></>;
  return (
    <div className="publication-body">
      <span className="publication-page-date">
        {publicationDateDisplay(publicationDetails.date)}
      </span>
      <h2 className="publication-page-title">{publicationDetails.title}</h2>
      <PublicationSources sources={publicationDetails.sources} />
      <div>
        {publicationDetails.authors ? (
          <PublicationAuthors publicationAuthors={publicationDetails.authors} />
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
  const linkTypeCustomText = (sourceType) => {
    switch (sourceType) {
      case 'doc' || 'pdf' || 'ppt' || 'xls' || 'ps':
        return `Download ${sourceType}`;
      case 'html':
        return 'Full text link';
      case 'text':
        return `View ${sourceType}`;
      default:
        return `View ${sourceType}`;
    }
  };
  const [showMore, setShowMore] = useState(false);
  if (!sources || sources.length === 0) return <></>;
  const genericLink = (source, includeURL) => (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="publication-page-source-link"
    >
      {linkTypeCustomText(source.type)}
      {includeURL ? (
        <span className="publication-page-extra-option-url">{source.url}</span>
      ) : null}
    </a>
  );
  return (
    <>
      <div
        className={
          showMore
            ? 'publication-page-source-container-shorter'
            : 'publication-page-source-container'
        }
      >
        {showMore ? <div></div> : genericLink(sources[0])}
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
          {sources.map((source) => (
            <p
              className="publication-page-source-extra-option"
              key={source.url}
            >
              {genericLink(source, true)}
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}

function PublicationAuthors({publicationAuthors}) {
  if (!publicationAuthors) return <></>;
  const uniqueAuthors = getUniqueAuthorsFromAuthors(publicationAuthors);

  return uniqueAuthors.map((author) => {
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
