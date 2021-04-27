import React, {useContext, useEffect, useState} from 'react';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import LinkAuthorIDForm from '../../../components/Publication/ConnectToPublications/ConnectToPublications';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {SmallPublicationListItem} from '../../../components/Publication/PublicationListItem';
import firebase from '../../../firebase';
import ErrorMessage from '../../../components/Forms/ErrorMessage';
import CreateCustomPublication from '../../../components/Publication/CreateCustomPublication';

import './UserPage.css';
import './EditUserPage.css';

const getPublicationsByAuthorIDExpression = firebase
  .functions()
  .httpsCallable('microsoft-getPublicationsByAuthorIDExpression');

export default function EditUserPublications({children}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
  const {userProfile, user, authLoaded} = useContext(AuthContext);
  if (!authLoaded) return <LoadingSpinnerPage />;
  if (user && !userProfile) return null;
  if (userProfile.microsoftIDs && userProfile.microsoftIDs.length !== 0)
    return (
      <PaddedPageContainer>
        {children}
        <FetchPublicationsForAuthor authorIDs={userProfile.microsoftIDs} />
        <CreateCustomPublication />
      </PaddedPageContainer>
    );

  return (
    <PaddedPageContainer>
      {children}
      {linkingAuthor ? (
        <LinkUserToPublications setLinkingAuthor={setLinkingAuthor} />
      ) : (
        <>
          <p>
            We can automatically populate your profile with publications to save
            you time.
          </p>
          <div className="link-user-to-publications-button-container">
            <SecondaryButton onClick={() => setLinkingAuthor(true)}>
              Connect publications to profile
            </SecondaryButton>
          </div>
          <p className="link-user-to-publications-sync-text">
            This will sync your Labspoon profile to Microsoft Academic
          </p>
        </>
      )}
    </PaddedPageContainer>
  );
}

function LinkUserToPublications({setLinkingAuthor}) {
  const cancel = () => setLinkingAuthor(false);
  return (
    <LinkAuthorIDForm
      cancel={cancel}
      submitBehaviour={() => {
        cancel();
        window.location.reload();
      }}
    />
  );
}

function FetchPublicationsForAuthor({authorIDs}) {
  const [fetchedPubs, setFetchedPubs] = useState([]);

  return (
    <div>
      {fetchedPubs.length > 0 ? (
        <h3>Here are the new publications we have fetched:</h3>
      ) : (
        <>
          <h3 className="edit-user-pubs-already-linked-title">
            Your publications are linked.
          </h3>
        </>
      )}
      <FetchMorePubsForAuthorButtonAndResults
        fetchedPubs={fetchedPubs}
        setFetchedPubs={setFetchedPubs}
        authorIDs={authorIDs}
      />
    </div>
  );
}

export function FetchMorePubsForAuthorButtonAndResults({
  fetchedPubs,
  setFetchedPubs,
  CustomSearchButton,
  authorIDs,
}) {
  const [error, setError] = useState(false);
  const [pubSearchOffset, setPubSearchOffset] = useState({});
  const [fetchingMorePubs, setFetchingMorePubs] = useState(false);
  if (!authorIDs) return;

  useEffect(() => {
    const newOffset = {};
    authorIDs.forEach((authorID) => {
      newOffset[authorID] = 1;
    });
    setPubSearchOffset(() => newOffset);
  }, []);

  const pubResultsList = fetchedPubs.map((fetchedPub, i) => (
    <SmallPublicationListItem
      publication={fetchedPub}
      key={
        fetchedPub.microsoftID ? fetchedPub.microsoftID : fetchedPub.name + i
      }
    />
  ));

  let fetchingOrFetchButton;

  if (fetchingMorePubs)
    fetchingOrFetchButton = (
      <div className="edit-user-pubs-fetch-more-button-container">
        <div className="edit-user-pubs-fetching">
          Fetching<div className="edit-user-pubs-fetching-dots"></div>
        </div>
      </div>
    );
  else
    fetchingOrFetchButton =
      CustomSearchButton && fetchedPubs.length === 0 ? (
        <CustomSearchButton
          authorIDs={authorIDs}
          setFetchingMorePubs={setFetchingMorePubs}
          setError={setError}
          error={error}
          setFetchedPubs={setFetchedPubs}
          pubSearchOffset={pubSearchOffset}
          setPubSearchOffset={setPubSearchOffset}
        />
      ) : (
        <div className="edit-user-pubs-fetch-more-button-container">
          <SecondaryButton
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
            Fetch {fetchedPubs.length > 0 ? 'More' : 'Recent'} Publications
          </SecondaryButton>
        </div>
      );

  return (
    <>
      {pubResultsList}
      {fetchingOrFetchButton}
      {error && (
        <ErrorMessage noBorder={true}>
          Something went wrong. Please try again.
        </ErrorMessage>
      )}
    </>
  );
}

export async function fetchRecentPublications(
  authorID,
  setFetchingMorePubs,
  setError,
  error,
  setFetchedPubs,
  pubSearchOffset,
  setPubSearchOffset
) {
  if (error) setError(false);
  const convertedAuthorID = Number(authorID);
  const expression = `Composite(AA.AuId=${convertedAuthorID})`;
  const count = 10;
  const offset = pubSearchOffset[authorID];
  setFetchingMorePubs(true);
  await getPublicationsByAuthorIDExpression({
    expression: expression,
    count: count,
    offset: offset,
  })
    .then((resp) => {
      setPubSearchOffset((currentOffset) => {
        const newOffset = {...currentOffset};
        newOffset[authorID] = currentOffset[authorID] + count;
        return newOffset;
      });
      setFetchedPubs((currentPubs) => {
        // in case msAcademic has an author down twice for the same publication with different IDs
        const uniqueNewPubs = resp.data.filter(
          (publication) =>
            !currentPubs.some(
              (currentPub) => currentPub.microsoftID === publication.microsoftID
            )
        );
        return [...currentPubs, ...uniqueNewPubs];
      });
    })
    .catch((err) => {
      console.error(
        `unable to fetch recent publications for user with microsoftID ${authorID} ${err}`
      );
      setError(true);
    });
  setFetchingMorePubs(false);
}
