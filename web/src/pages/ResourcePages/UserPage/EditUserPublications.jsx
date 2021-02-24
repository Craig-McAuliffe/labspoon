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

import './UserPage.css';
import './EditUserPage.css';

const getPublicationsByAuthorIDExpression = firebase
  .functions()
  .httpsCallable('microsoft-getPublicationsByAuthorIDExpression');

export default function EditUserPublications({children}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
  const [fetchingMorePubs, setFetchingMorePubs] = useState(false);
  const [fetchedPubs, setFetchedPubs] = useState([]);
  const [error, setError] = useState(false);
  const [pubSearchOffset, setPubSearchOffset] = useState(0);
  const {userProfile, user, authLoaded} = useContext(AuthContext);
  if (!authLoaded) return <LoadingSpinnerPage />;
  if (user && !userProfile) return null;
  if (userProfile.microsoftID)
    return (
      <PaddedPageContainer>
        {children}

        {fetchedPubs.length > 0 ? (
          <>
            {' '}
            <h3>Here are the new publication we have fetched:</h3>
            {fetchedPubs.map((fetchedPub) => (
              <SmallPublicationListItem
                publication={fetchedPub}
                key={fetchedPub.microsoftID}
              />
            ))}
          </>
        ) : (
          <>
            <h3 className="edit-user-pubs-already-linked-title">
              Your publications are linked.
            </h3>
            <p>
              Are we missing some publications on your profile? Try fetching
              them:
            </p>
          </>
        )}
        <div className="edit-user-pubs-fetch-more-button-container">
          {fetchingMorePubs ? (
            <div className="edit-user-pubs-fetching">
              Fetching<div className="edit-user-pubs-fetching-dots"></div>
            </div>
          ) : (
            <SecondaryButton
              onClick={() =>
                fetchRecentPublications(
                  userProfile.microsoftID,
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
          )}
        </div>
        {error && (
          <ErrorMessage noBorder={true}>
            Something went wrong. Please try again.
          </ErrorMessage>
        )}
        <p className="link-to-pubs-already-linked-note">
          If you have incorrectly linked your account, please let us know
          through the <Link to="/contact">contact page.</Link>
        </p>
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

async function fetchRecentPublications(
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
