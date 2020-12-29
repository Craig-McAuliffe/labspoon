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
  .httpsCallable('users-getSuggestedPublicationsForAuthorName');
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
          getSuggestedPublicationsForAuthorName({
            name: name,
          })
            .then((fetchedSuggestedPublications) => {
              setLoadingState(LOADED);
              setSuggestedPublications(fetchedSuggestedPublications.data);
            })
            .catch((err) => {
              console.log(err);
              setLoadingState(ERROR);
            });
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
          <SecondaryButton type="submit">
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
            onClick={cancel}
          >
            Cancel
          </SecondaryButton>
        )}
      </form>
      {searchProgress()}
      {suggestedPublications.length > 0 ? (
        <SuggestedPublications
          suggestedPublications={suggestedPublications}
          submitBehaviour={submitBehaviour}
        />
      ) : null}
    </div>
  );
}

function SuggestedPublications({suggestedPublications, submitBehaviour}) {
  const [
    selectedPublicationsAuthorID,
    setSelectedPublicationsAuthorID,
  ] = useState();
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      {submitting ? (
        <LoadingSpinner />
      ) : (
        <div className="onboarding-suggested-publications-container">
          <SuggestedPublicationItems
            suggestedPublications={suggestedPublications}
            selectedPublicationsAuthorID={selectedPublicationsAuthorID}
            setSelectedPublicationsAuthorID={setSelectedPublicationsAuthorID}
          />
        </div>
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
              .catch((err) => console.error(err));
          }}
          inactive={selectedPublicationsAuthorID || submitting ? false : true}
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
              suggestedPublication.microsoftAcademicIDMatch
                ? 'onboarding-publication-selector-button-selected'
                : 'onboarding-publication-selector-button'
            }
            type="button"
            onClick={() => {
              if (
                suggestedPublication.microsoftAcademicIDMatch ===
                selectedPublicationsAuthorID
              )
                setSelectedPublicationsAuthorID(undefined);
              else
                setSelectedPublicationsAuthorID(
                  suggestedPublication.microsoftAcademicIDMatch
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
            key={author.id}
            className="onboarding-suggested-publication-authors"
          >
            ...and {i + 1} more.
          </p>
        );
      return <></>;
    }
    return (
      <p key={author.id} className="onboarding-suggested-publication-authors">
        {author.name}
        {i === authors.length - 1 ? null : ','}
      </p>
    );
  });
}
