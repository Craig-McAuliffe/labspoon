import React, {useEffect, useState} from 'react';
import firebase from '../../../firebase';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import {SearchIconGrey} from '../../../assets/HeaderIcons';
import SecondaryButton from '../../Buttons/SecondaryButton';

import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import GeneralError from '../../GeneralError';
import {Alert} from 'react-bootstrap';
import './ConnectToPublications.css';
import {Link} from 'react-router-dom';

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
        offset: firstTime ? 0 : parentSearchOffset,
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
      <h3>
        Connect your Labspoon account to your publications on Microsoft Academic
      </h3>
      <p className="connect-publications-note">
        Note: This will permanently link your profile.
      </p>
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
const MAX_AUTHOR_IDS = 3;
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
    selectedPublicationsAuthorIDs,
    setSelectedPublicationsAuthorIDs,
  ] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [maxIDsSelected, setMaxIDsSelected] = useState(false);
  useEffect(() => {
    if (selectedPublicationsAuthorIDs.length < MAX_AUTHOR_IDS) {
      if (maxIDsSelected) setMaxIDsSelected(false);
      return;
    }
    setMaxIDsSelected(true);
  }, [selectedPublicationsAuthorIDs]);
  return (
    <>
      {maxIDsSelected && (
        <Alert variant="warning">
          You can link to a maximum of {MAX_AUTHOR_IDS} author IDs. If any of
          your publications remain unselected,{' '}
          <Link to="/contact/help">please let us know.</Link>
        </Alert>
      )}
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
              selectedPublicationsAuthorIDs={selectedPublicationsAuthorIDs}
              setSelectedPublicationsAuthorIDs={
                setSelectedPublicationsAuthorIDs
              }
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
            if (selectedPublicationsAuthorIDs.length === 0) return;
            setMicrosoftAcademicIDByPublicationMatches({
              microsoftAcademicAuthorIDs: selectedPublicationsAuthorIDs,
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
          disabled={
            selectedPublicationsAuthorIDs.length === 0 || submitting
              ? true
              : false
          }
        >
          Link Papers to Profile
        </PrimaryButton>
      </div>
    </>
  );
}

function SuggestedPublicationItems({
  suggestedPublications,
  selectedPublicationsAuthorIDs,
  setSelectedPublicationsAuthorIDs,
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
              selectedPublicationsAuthorIDs.includes(
                suggestedPublication.microsoftAcademicAuthorID
              )
                ? 'onboarding-publication-selector-button-selected'
                : 'onboarding-publication-selector-button'
            }
            type="button"
            onClick={() => {
              if (
                selectedPublicationsAuthorIDs.includes(
                  suggestedPublication.microsoftAcademicAuthorID
                )
              )
                setSelectedPublicationsAuthorIDs((selectedIDs) =>
                  selectedIDs.filter(
                    (selectedID) =>
                      selectedID !==
                      suggestedPublication.microsoftAcademicAuthorID
                  )
                );
              else
                setSelectedPublicationsAuthorIDs((selectedIDs) => {
                  if (selectedPublicationsAuthorIDs.length >= MAX_AUTHOR_IDS)
                    return selectedIDs;
                  if (
                    selectedPublicationsAuthorIDs.includes(
                      suggestedPublication.microsoftAcademicAuthorID
                    )
                  )
                    return selectedIDs;
                  return [
                    ...selectedIDs,
                    suggestedPublication.microsoftAcademicAuthorID,
                  ];
                });
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
