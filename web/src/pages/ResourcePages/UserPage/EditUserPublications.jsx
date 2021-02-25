import React, {useContext, useState} from 'react';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import LinkAuthorIDForm from '../../../components/Publication/ConnectToPublications/ConnectToPublications';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {Link} from 'react-router-dom';
import {SmallPublicationListItem} from '../../../components/Publication/PublicationListItem';
import firebase from '../../../firebase';
import ErrorMessage from '../../../components/Forms/ErrorMessage';
import CreateCustomPublication from '../../../components/Publication/CreateCustomPublication';
import {Alert} from 'react-bootstrap';

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
  if (userProfile.microsoftID)
    return (
      <PaddedPageContainer>
        {children}

        <FetchPublicationsForAuthor authorID={userProfile.microsoftID} />
        <CreateCustomPublication />
        <div className="link-to-pubs-already-linked-note">
          <Alert variant="warning">
            If you have incorrectly linked your account, please let us know
            through the <Link to="/contact">contact page.</Link>
          </Alert>
        </div>
      </PaddedPageContainer>
    );

  return (
    <PaddedPageContainer>
      {children}
      {linkingAuthor ? (
        <LinkUserToPublications setLinkingAuthor={setLinkingAuthor} />
      ) : (
        <div className="link-user-to-publications-button-container">
          <SecondaryButton onClick={() => setLinkingAuthor(true)}>
            Connect publications to profile
          </SecondaryButton>
        </div>
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

function FetchPublicationsForAuthor({authorID}) {
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
          <p>
            Are we missing some publications on your profile? Try fetching them:
          </p>
        </>
      )}
      <FetchMorePubsForAuthorButtonAndResults
        fetchedPubs={fetchedPubs}
        setFetchedPubs={setFetchedPubs}
        authorID={authorID}
      />
    </div>
  );
}

export function FetchMorePubsForAuthorButtonAndResults({
  fetchedPubs,
  setFetchedPubs,
  CustomSearchButton,
  authorID,
}) {
  const [error, setError] = useState(false);
  const [pubSearchOffset, setPubSearchOffset] = useState(0);
  const [fetchingMorePubs, setFetchingMorePubs] = useState(false);

  const pubResultsList = fetchedPubs.map((fetchedPub) => (
    <SmallPublicationListItem
      publication={fetchedPub}
      key={fetchedPub.microsoftID}
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
          authorID={authorID}
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
            onClick={() =>
              fetchRecentPublications(
                authorID,
                setFetchingMorePubs,
                setError,
                error,
                setFetchedPubs,
                pubSearchOffset,
                setPubSearchOffset
              )
            }
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
  const offset = pubSearchOffset;
  setFetchingMorePubs(true);
  await getPublicationsByAuthorIDExpression({
    expression: expression,
    count: count,
    offset: offset,
  })
    .then((resp) => {
      setPubSearchOffset((currentOffset) => currentOffset + count);
      setFetchedPubs((currentPubs) => [...currentPubs, ...resp.data]);
    })
    .catch((err) => {
      console.error(
        `unable to fetch recent publications for user with microsoftID ${authorID} ${err}`
      );
      setError(true);
    });
  setFetchingMorePubs(false);
}
