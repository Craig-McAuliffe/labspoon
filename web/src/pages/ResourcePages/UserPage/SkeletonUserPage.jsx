import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import {useHistory, useParams, Redirect} from 'react-router-dom';
import {db} from '../../../firebase';
import {getActiveTabID} from '../../../helpers/filters';
import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
  NewFilterMenuWrapper,
  FilterManager,
} from '../../../components/FilterableResults/FilterableResults';

import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {dbPublicationToJSPublication} from '../../../helpers/publications';
import {
  fetchRecentPublications,
  FetchMorePubsForAuthorButtonAndResults,
} from './EditUserPublications';

import './SkeletonUserPage.css';
import TertiaryButton from '../../../components/Buttons/TertiaryButton';

const PUBLICATIONS_TAB = 'publications';

export default function SkeletonUserPage() {
  const [userID, setUserID] = useState(undefined);
  const [userDetails, setUserDetails] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const history = useHistory();

  if (userID !== params.userID) setUserID(params.userID);

  useEffect(() => {
    Promise.resolve(fetchMicrosoftUser(userID))
      .then((userDetails) => {
        if (!userDetails) {
          history.push('/notfound');
        }
        setUserDetails(userDetails);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  if (loading) return <LoadingSpinner />;

  const fetchResults = (_a, _b, filterOptions, _c) =>
    fetchFeedData(userID, filterOptions);
  const tabs = [
    {
      collectionName: 'Tabs',
      options: [
        {
          enabled: true,
          data: {
            id: PUBLICATIONS_TAB,
            name: 'Publications',
          },
        },
      ],
    },
  ];

  if (userDetails.processed)
    return <Redirect to={`/user/${userDetails.processed}`} />;
  return (
    <div className="content-layout">
      <div className="details-container">
        <h4>
          Auto Generated &nbsp;
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="right"
            overlay={autoGeneratedPopover}
          >
            <FontAwesomeIcon icon={faQuestionCircle} />
          </OverlayTrigger>
        </h4>
        <br />
        <UserInfo user={userDetails} />
      </div>
      <FilterableResults fetchResults={fetchResults} limit={10}>
        <div className="feed-container">
          <FilterManager>
            <NewFilterMenuWrapper />
            <ResourceTabs tabs={tabs} />
          </FilterManager>
          <FetchPublicationsForSkeletonProfile authorID={userID} />
          <NewResultsWrapper />
        </div>
      </FilterableResults>
    </div>
  );
}

const autoGeneratedPopover = (
  <Popover>
    <Popover.Title as="h3">Auto Generated Profiles</Popover.Title>
    <Popover.Content>
      This profile was created by Labspoon to help users navigate publications
      and find co-authors. None of the content here was created by the author
      directly and they are not affiliated with Labspoon.
    </Popover.Content>
  </Popover>
);

function UserInfo({user}) {
  return (
    <div className="skeleton-user-header">
      <h2>{user.DAuN}</h2>
      <h4>{user.DAfN}</h4>
    </div>
  );
}

async function fetchMicrosoftUser(userID) {
  return db
    .doc(`MSUsers/${userID}`)
    .get()
    .then((userDetails) => userDetails.data())
    .catch((err) => console.log(err));
}

function fetchFeedData(userID, filterOptions) {
  const activeTab = getActiveTabID(filterOptions);
  let results;
  switch (activeTab) {
    case PUBLICATIONS_TAB:
      const publicationsPromise = db
        .collection('MSUsers')
        .doc(userID)
        .collection('publications')
        .get()
        .then((msPublications) => {
          if (msPublications.empty) return [];
          const publicationPromises = [];
          msPublications.forEach((msPublication) => {
            const labspoonPublicationID = msPublication.data().processed;
            if (!labspoonPublicationID) return;
            const publicationPromise = db
              .collection('publications')
              .doc(labspoonPublicationID)
              .get()
              .then((publication) => {
                publication = dbPublicationToJSPublication(publication.data());
                publication.id = labspoonPublicationID;
                return publication;
              });
            publicationPromises.push(publicationPromise);
          });
          return Promise.all(publicationPromises);
        })
        .catch((err) => console.error(err));
      return [publicationsPromise, undefined];
    default:
      results = [];
  }
  return results;
}

function FetchPublicationsForSkeletonProfile({authorID}) {
  const [fetchedPubs, setFetchedPubs] = useState([]);
  return (
    <>
      {fetchedPubs.length === 0 && (
        <h4 className="skeleton-profile-missing-pubs-title">
          Is this profile missing publications?
        </h4>
      )}
      <FetchMorePubsForAuthorButtonAndResults
        authorIDs={[authorID]}
        fetchedPubs={fetchedPubs}
        setFetchedPubs={setFetchedPubs}
        CustomSearchButton={SkeletonProfileFetchMorePubsCustomButton}
      />
    </>
  );
}

function SkeletonProfileFetchMorePubsCustomButton({
  authorIDs,
  setFetchingMorePubs,
  setError,
  error,
  setFetchedPubs,
  pubSearchOffset,
  setPubSearchOffset,
}) {
  return (
    <div className="skeleton-profile-missing-pubs-action">
      <TertiaryButton
        onClick={async () => {
          const fetchingPromises = authorIDs.map((authorID) =>
            fetchRecentPublications(
              authorID,
              setFetchingMorePubs,
              setError,
              error,
              setFetchedPubs,
              pubSearchOffset,
              setPubSearchOffset
            )
          );
          await Promise.all(fetchingPromises);
        }}
      >
        Fetch more
      </TertiaryButton>
    </div>
  );
}
