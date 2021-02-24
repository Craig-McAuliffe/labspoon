import React, {useState} from 'react';
import firebase from '../../../firebase';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import {SearchIconGrey} from '../../../assets/HeaderIcons';
import SecondaryButton from '../../Buttons/SecondaryButton';

import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import GeneralError from '../../GeneralError';
import {Alert} from 'react-bootstrap';
import './ConnectToPublications.css';

const getSuggestedPublicationsForAuthorName = firebase
  .functions()
  .httpsCallable('microsoft-getSuggestedPublicationsForAuthorName');
const interpretAuthorPubSearch = firebase
  .functions()
  .httpsCallable('microsoft-interpretAuthorPubSearch');
const setMicrosoftAcademicIDByPublicationMatches = firebase
  .functions()
  .httpsCallable('users-setMicrosoftAcademicIDByPublicationMatches');

const LOADING = 'loading';
const ERROR = 'error';
const LOADED = 'loaded';

export default function LinkAuthorIDForm({submitBehaviour, cancel}) {
  const [name, setName] = useState('');
  const [suggestedPublications, setSuggestedPublications] = useState([]);
  const [loadingState, setLoadingState] = useState();
  const [hasMore, setHasMore] = useState();
  const [parentSearchOffset, setParentSearchOffset] = useState(0);
  const [fetchedExpressionsAndNames, setFetchedExpressionsAndNames] = useState(
    []
  );
  const fetchSuggestedPublications = async (firstTime) => {
    if (loadingState === LOADING) return;
    setLoadingState(LOADING);
    const fetchSuggestedPublicationsWithExpressionsAndNames = (
      expressionsAndNamesToEvaluate
    ) => {
      getSuggestedPublicationsForAuthorName({
        expressionsAndNames: expressionsAndNamesToEvaluate,
        offset: parentSearchOffset,
      })
        .then((fetchedSuggestedPublications) => {
          setLoadingState(LOADED);
          setSuggestedPublications((currentPublications) => [
            ...currentPublications,
            ...fetchedSuggestedPublications.data.publications,
          ]);
          setHasMore(
            !(fetchedSuggestedPublications.data.publications.length === 0)
          );
          setParentSearchOffset(fetchedSuggestedPublications.data.offset);
        })
        .catch((err) => {
          console.error(err);
          setLoadingState(ERROR);
        });
    };

    if (firstTime) {
      setSuggestedPublications([]);
      setHasMore(undefined);
      setParentSearchOffset(0);
      const interpretAuthorPubSearchResponse = await interpretAuthorPubSearch({
        name: name,
      }).catch((err) => {
        console.error(`unable to interpret name ${name} ${err}`);
        setLoadingState(ERROR);
        return;
      });
      if (
        !interpretAuthorPubSearchResponse ||
        !interpretAuthorPubSearchResponse.data
      ) {
        setLoadingState(LOADED);
        return;
      }
      const expressionsAndNames = interpretAuthorPubSearchResponse.data;
      setFetchedExpressionsAndNames(expressionsAndNames);
      if (!expressionsAndNames || expressionsAndNames.length === 0) {
        setLoadingState(LOADED);
        return;
      }
      return fetchSuggestedPublicationsWithExpressionsAndNames(
        expressionsAndNames
      );
    }
    fetchSuggestedPublicationsWithExpressionsAndNames(
      fetchedExpressionsAndNames
    );
  };

  const searchProgress = () => {
    if (loadingState === LOADING) return <LoadingSpinner />;
    if (loadingState === ERROR) return <GeneralError />;
    if (loadingState === LOADED) return null;
  };

  return (
    <div>
      <h3>Connect your Labspoon account to your publications</h3>
      <Alert variant="warning">Note: You can only do this once.</Alert>
      <form
        className="onboarding-author-link-form"
        onSubmit={(e) => {
          e.preventDefault();
          setLoadingState(LOADING);
          fetchSuggestedPublications(true);
        }}
      >
        <h4>Search for your publications:</h4>
        <input
          type="text"
          className="connect-to-pubs-name-input"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name as it appears on publications"
        />
        <div className="connect-to-pubs-search-container">
          <SecondaryButton type="submit" inactive={loadingState === LOADING}>
            <div className="connect-to-pubs-search-icon-container">
              <SearchIconGrey />
            </div>
            <span className="connect-to-pubs-search-button-text">Search</span>
          </SecondaryButton>
        </div>
        {cancel && (
          <SecondaryButton
            className="search-cancel-button"
            type="button"
            onClick={() => {
              if (loadingState === LOADING) return;
              cancel();
            }}
            inactive={loadingState === LOADING}
          >
            Cancel
          </SecondaryButton>
        )}
      </form>
      {suggestedPublications.length > 0 ? (
        <SuggestedPublications
          suggestedPublications={suggestedPublications}
          submitBehaviour={submitBehaviour}
          setLoadingState={setLoadingState}
          fetchMore={fetchSuggestedPublications}
          hasMore={hasMore}
          searchProgress={searchProgress}
          loadingState={loadingState}
        />
      ) : (
        <div>{searchProgress()}</div>
      )}
    </div>
  );
}

function SuggestedPublications({
  suggestedPublications,
  submitBehaviour,
  setLoadingState,
  fetchMore,
  hasMore,
  searchProgress,
  loadingState,
}) {
  const [
    selectedPublicationsAuthorID,
    setSelectedPublicationsAuthorID,
  ] = useState();
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      {submitting ? (
        <>
          <LoadingSpinner />
          <h4>This will take a few seconds.</h4>
        </>
      ) : (
        <>
          <div className="onboarding-suggested-publications-container">
            <SuggestedPublicationItems
              suggestedPublications={suggestedPublications}
              selectedPublicationsAuthorID={selectedPublicationsAuthorID}
              setSelectedPublicationsAuthorID={setSelectedPublicationsAuthorID}
            />
          </div>
          <div className="link-pub-author-fetch-more-container">
            {hasMore && (
              <SecondaryButton
                onClick={() => fetchMore()}
                inactive={loadingState === LOADING}
              >
                Fetch More
              </SecondaryButton>
            )}
          </div>
          <div style={{marginTop: '20px'}}>{searchProgress()}</div>
        </>
      )}
      <div className="onboarding-suggested-publications-submit-container">
        <PrimaryButton
          type="button"
          onClick={() => {
            setSubmitting(true);
            if (selectedPublicationsAuthorID === undefined) return;
            setMicrosoftAcademicIDByPublicationMatches({
              microsoftAcademicAuthorID: selectedPublicationsAuthorID,
            })
              .then(() => {
                submitBehaviour();
                setSubmitting(false);
              })
              .catch((err) => {
                setSubmitting(false);
                console.error(err);
                setLoadingState(ERROR);
                if (err.code.includes('unauthenticated')) {
                  alert('You must login in order to link your account.');
                  return;
                }
                if (err.code.includes('invalid-argument')) {
                  alert(
                    'You must select publications in order to link your account.'
                  );
                  return;
                }
                if (err.code.includes('not-found')) {
                  alert(
                    'You must select publications in order to link your account.'
                  );
                  return;
                }
                if (
                  err.code.includes('already-exists') &&
                  err.message.includes('linked to a microsoft id')
                ) {
                  alert(
                    'You have already linked your account. If you made a mistake and would like to link to a different author, please contact our support team at help@labspoon.com.'
                  );
                  return;
                }
                if (
                  err.code.includes('already-exists') &&
                  err.message.includes('linked to a labspoon user')
                ) {
                  alert(
                    'Someone has already linked to that author. If this is you, please let us know through the contact page.'
                  );
                  return;
                }
                alert(
                  'Something went wrong while linking your account. Sorry about that. Please try again.'
                );
                return;
              });
          }}
          disabled={selectedPublicationsAuthorID || submitting ? false : true}
        >
          Link Papers to Profile
        </PrimaryButton>
      </div>
    </>
  );
}

function SuggestedPublicationItems({
  suggestedPublications,
  selectedPublicationsAuthorID,
  setSelectedPublicationsAuthorID,
}) {
  return suggestedPublications.map((suggestedPublication, i) => {
    if (!suggestedPublication) return null;
    return (
      <React.Fragment key={suggestedPublication.publicationInfo.title + i}>
        <div className="onboarding-suggested-publication-title-container">
          <h4 className="onboarding-suggested-publication-title">
            {suggestedPublication.publicationInfo.title}
          </h4>
          <SuggestedPublicationAuthors
            authors={suggestedPublication.publicationInfo.authors}
          />
        </div>
        <div className="post-selector-container">
          <button
            className={
              selectedPublicationsAuthorID ===
              suggestedPublication.microsoftAcademicAuthorID
                ? 'onboarding-publication-selector-button-selected'
                : 'onboarding-publication-selector-button'
            }
            type="button"
            onClick={() => {
              if (
                suggestedPublication.microsoftAcademicAuthorID ===
                selectedPublicationsAuthorID
              )
                setSelectedPublicationsAuthorID(undefined);
              else
                setSelectedPublicationsAuthorID(
                  suggestedPublication.microsoftAcademicAuthorID
                );
            }}
          />
        </div>
      </React.Fragment>
    );
  });
}

function SuggestedPublicationAuthors({authors}) {
  return authors.map((author, i) => {
    if (i > 6) {
      if (i === authors.length - 1)
        return (
          <p
            key={author.microsoftID + '-' + i}
            className="onboarding-suggested-publication-authors"
          >
            ...and {i + 1} more.
          </p>
        );
      return (
        <React.Fragment key={author.microsoftID + '-' + i}></React.Fragment>
      );
    }
    return (
      <p
        key={author.microsoftID + '-' + i}
        className="onboarding-suggested-publication-authors"
      >
        {author.name}
        {i === authors.length - 1 ? null : ','}
      </p>
    );
  });
}
