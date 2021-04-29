import React, {useContext, useEffect, useState} from 'react';
import NegativeButton from '../../../Buttons/NegativeButton';
import * as Yup from 'yup';
import firebase, {db} from '../../../../firebase';
import {CreatePostTextArea, TextInput} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import {
  CreatingPostContext,
  sortThrownCreatePostErrors,
  openTwitterWithPopulatedTweet,
  SwitchTagMethod,
} from './CreatePost';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import PublicationListItem, {
  SmallPublicationListItem,
} from '../../../Publication/PublicationListItem';
import {FindAndAddUsersToForm} from '../../../Forms/AddUserToForm';
import {
  SelectedAuthors,
  createCustomPublication,
  MAX_DAILY_PUBLICATIONS_COUNT,
  MaxDailyPublicationLimitReached,
} from '../../../Publication/CreateCustomPublication';
import {AuthContext} from '../../../../App';
import {
  PublicationIcon,
  TagResourceIcon,
} from '../../../../assets/ResourceTypeIcons';
import InputError from '../../../Forms/InputError';
import ErrorMessage from '../../../Forms/ErrorMessage';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import SecondaryButton from '../../../Buttons/SecondaryButton';
import './CreatePost.css';
import {algoliaPublicationToDBPublicationListItem} from '../../../../helpers/publications';
import {Alert} from 'react-bootstrap';
import {FilterableResultsContext} from '../../../FilterableResults/FilterableResults';
import {POST} from '../../../../helpers/resourceTypeDefinitions';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function PublicationPostForm({postType, setPostType}) {
  const {userProfile} = useContext(AuthContext);
  const {
    selectedTopics,
    setSubmittingPost,
    setPostSuccess,
    savedTitleText,
  } = useContext(CreatingPostContext);
  const [publication, setPublication] = useState();
  const [isQuickCreatingPub, setIsQuickCreatingPub] = useState(false);
  const [customPublicationAuthors, setCustomPublicationAuthors] = useState([
    userProfile,
  ]);
  const [pubSubmissionError, setPubSubmissionError] = useState(false);
  const [customPublication, setCustomPublication] = useState({
    title: '',
    url: '',
  });
  const [customPublicationErrors, setCustomPublicationErrors] = useState();
  const [
    customPubSuccessfullyCreated,
    setCustomPubSuccessfullyCreated,
  ] = useState(false);
  const [hasHitMaxDailyPublications, setHasHitMaxDailyPublications] = useState(
    false
  );
  const userID = userProfile ? userProfile.id : undefined;
  useEffect(async () => {
    if (!userID) return;
    if (hasHitMaxDailyPublications || !isQuickCreatingPub) return;
    const publicationActivityCount = await db
      .doc(`activity/publicationsActivity/creators/${userID}`)
      .get()
      .catch((err) => console.error(err));
    if (
      publicationActivityCount &&
      publicationActivityCount.exists &&
      publicationActivityCount.data().dailyPublicationCount >=
        MAX_DAILY_PUBLICATIONS_COUNT
    )
      setHasHitMaxDailyPublications(true);
  }, [userID, isQuickCreatingPub]);

  const {setResults} = useContext(FilterableResultsContext);

  const initialValues = {
    title: savedTitleText ? savedTitleText : '',
  };

  const submitChanges = (res, isTweeting) =>
    submitPublicationPost(
      res,
      isTweeting,
      customPublicationErrors,
      setCustomPublicationErrors,
      pubSubmissionError,
      setPubSubmissionError,
      customPublication,
      setCustomPubSuccessfullyCreated,
      isQuickCreatingPub,
      setSubmittingPost,
      setPostSuccess,
      setResults,
      setIsQuickCreatingPub,
      setCustomPublication,
      selectedTopics,
      customPublicationAuthors,
      publication,
      hasHitMaxDailyPublications,
      customPubSuccessfullyCreated
    );
  return (
    <>
      <PostForm
        onSubmit={submitChanges}
        initialValues={initialValues}
        formID="create-publication-post-form"
        outsideFormComponents={
          <SelectAndCreatePublication
            publication={publication}
            setPublication={setPublication}
            isQuickCreatingPub={isQuickCreatingPub}
            setIsQuickCreatingPub={setIsQuickCreatingPub}
            customPubSuccessfullyCreated={customPubSuccessfullyCreated}
            userIsVerified={userProfile.isVerified}
            customPublicationAuthors={customPublicationAuthors}
            setCustomPublicationAuthors={setCustomPublicationAuthors}
            customPublication={customPublication}
            setCustomPublication={setCustomPublication}
            userID={userID}
            customPublicationErrors={customPublicationErrors}
            pubSubmissionError={pubSubmissionError}
            hasHitMaxDailyPublications={hasHitMaxDailyPublications}
          />
        }
      >
        <div className="creating-post-main-text-container">
          <CreatePostTextArea name="title" />
        </div>
        <TypeOfTaggedResourceDropDown
          setTaggedResourceType={setPostType}
          taggedResourceType={postType}
        />
      </PostForm>
    </>
  );
}

function SelectAndCreatePublication({
  publication,
  setPublication,
  isQuickCreatingPub,
  setIsQuickCreatingPub,
  customPubSuccessfullyCreated,
  userIsVerified,
  customPublicationAuthors,
  setCustomPublicationAuthors,
  customPublication,
  setCustomPublication,
  userID,
  customPublicationErrors,
  pubSubmissionError,
  hasHitMaxDailyPublications,
}) {
  return (
    <>
      <SelectPublication
        publication={publication}
        setPublication={setPublication}
        isQuickCreatingPub={isQuickCreatingPub}
        setIsQuickCreatingPub={setIsQuickCreatingPub}
        customPubSuccessfullyCreated={customPubSuccessfullyCreated}
        userIsVerified={userIsVerified}
      />
      {isQuickCreatingPub && (
        <PostQuickCreatePub
          customPublicationAuthors={customPublicationAuthors}
          setCustomPublicationAuthors={setCustomPublicationAuthors}
          customPublication={customPublication}
          setCustomPublication={setCustomPublication}
          userID={userID}
          customPublicationErrors={customPublicationErrors}
          pubSubmissionError={pubSubmissionError}
          hasHitMaxDailyPublications={hasHitMaxDailyPublications}
        />
      )}
    </>
  );
}
function SelectPublication({
  publication,
  setPublication,
  setIsQuickCreatingPub,
  isQuickCreatingPub,
  customPubSuccessfullyCreated,
  userIsVerified,
}) {
  const [displayedPublications, setDisplayedPublications] = useState([]);
  if (publication) {
    return (
      <div className="create-publication-post-list-item-container">
        <SmallPublicationListItem publication={publication} />
        <div className="create-publication-post-list-item-select-container">
          <NegativeButton
            onClick={() => {
              setPublication(undefined);
            }}
            smallVersion
          >
            Deselect
          </NegativeButton>
        </div>
      </div>
    );
  }
  // The "search" button is just there to prevent search/url switch
  // if the user clicks enter
  return (
    <div className="publication-post-search-section">
      <h4>Search Publications</h4>
      <div
        className={`resource-search-input-container${
          isQuickCreatingPub ? '-disabled' : ''
        }`}
      >
        <FormDatabaseSearch
          setDisplayedItems={setDisplayedPublications}
          indexName="_PUBLICATIONS"
          placeholderText=""
          displayedItems={displayedPublications}
          clearListOnNoResults={true}
          hasCustomContainer={true}
          hideSearchIcon={true}
        />
      </div>
      <div className="create-pub-post-alert-container">
        {customPubSuccessfullyCreated && (
          <Alert variant="primary">
            Your publication was successfully created. Only the post failed. You
            should be able to find that publication by searching.
          </Alert>
        )}
      </div>
      {!isQuickCreatingPub &&
        displayedPublications &&
        displayedPublications.length > 0 && (
          <PublicationSearchResults
            publications={displayedPublications}
            setTaggedPublication={setPublication}
          />
        )}
      {userIsVerified && (
        <SwitchTagMethod
          isCreating={isQuickCreatingPub}
          setIsCreating={setIsQuickCreatingPub}
        />
      )}
    </div>
  );
}

function PostQuickCreatePub({
  customPublicationAuthors,
  setCustomPublicationAuthors,
  customPublication,
  setCustomPublication,
  customPublicationErrors,
  pubSubmissionError,
  hasHitMaxDailyPublications,
}) {
  const [isDuplicateAuthor, setIsDuplicateAuthor] = useState(false);

  useEffect(async () => {
    if (!isDuplicateAuthor) return;
    await new Promise((resolve) =>
      setTimeout(() => {
        setIsDuplicateAuthor(false);
        resolve('resolved');
      }, 1000)
    );
  }, [isDuplicateAuthor]);
  const removeAuthor = (author) => {
    setCustomPublicationAuthors((currentAuthors) =>
      currentAuthors.filter((currentAuthor) => currentAuthor !== author)
    );
  };
  const checkForDuplicateAndAddUser = (user) => {
    if (
      customPublicationAuthors.some(
        (previouslySelectedAuthor) => previouslySelectedAuthor.id === user.id
      )
    ) {
      setIsDuplicateAuthor(true);
      return;
    }
    setCustomPublicationAuthors((existingAuthors) => [
      ...existingAuthors,
      user,
    ]);
  };

  if (hasHitMaxDailyPublications) return <MaxDailyPublicationLimitReached />;
  return (
    <div className="publication-post-quick-create-section">
      {pubSubmissionError && (
        <ErrorMessage noBorder={true}>
          Something went wrong while creating your publication. Please try
          again.
        </ErrorMessage>
      )}

      <div className="create-post-quick-create-pub-container">
        <div className="create-custom-publication-icon-container">
          <PublicationIcon />
          <h3>Custom Publication</h3>
        </div>
        <TextInput
          error={handlePubTitleError(customPublicationErrors)}
          value={customPublication.title}
          onChange={(e) =>
            setCustomPublication((existingCustomPublication) => {
              return {...existingCustomPublication, title: e.target.value};
            })
          }
          label="Title of the publication"
        />
        <TextInput
          error={handlePubUrlError(customPublicationErrors)}
          value={customPublication.url}
          onChange={(e) =>
            setCustomPublication((existingCustomPublication) => {
              return {...existingCustomPublication, url: e.target.value};
            })
          }
          label="Url of the publication"
        />
        {isDuplicateAuthor && (
          <Alert variant="warning">Author already added</Alert>
        )}
        <FindAndAddUsersToForm
          onUserSelect={(user) => checkForDuplicateAndAddUser(user)}
          searchBarLabel="Add authors on Labspoon"
        />
        <SelectedAuthors
          authors={customPublicationAuthors}
          removeAuthor={removeAuthor}
        />
      </div>
    </div>
  );
}

async function validateCustomPublication(customPublication) {
  const customPubValidationSchema = Yup.object({
    title: Yup.string()
      .required('Please enter the title of the publication')
      .max(1000, 'Publication title must be fewer than 1000 characters'),
    url: Yup.string()
      .required('Please enter the url of the publication')
      .url('Please enter a valid url'),
  });
  return customPubValidationSchema
    .validate(customPublication, {abortEarly: false})
    .then(() => {
      return [];
    })
    .catch((err) => {
      return err.errors;
    });
}

function handlePubTitleError(customPublicationErrors) {
  if (!customPublicationErrors || customPublicationErrors.length === 0)
    return null;
  if (customPublicationErrors.some((error) => error.includes('title')))
    return <InputError error={customPublicationErrors[0]} />;
}

function handlePubUrlError(customPublicationErrors) {
  if (!customPublicationErrors || customPublicationErrors.length === 0)
    return null;
  if (
    customPublicationErrors.length === 1 &&
    customPublicationErrors[0].includes('url')
  )
    return <InputError error={customPublicationErrors[0]} />;
  return <InputError error={customPublicationErrors[1]} />;
}

function PublicationSearchResults({publications, setTaggedPublication}) {
  const selectPublication = (publication) => {
    setTaggedPublication(publication);
  };
  return publications.map((publication) => {
    if (!publication.objectID) return null;
    publication.id = publication.objectID;
    return (
      <div
        key={publication.id}
        className="resource-result-with-selector-container"
      >
        <div className="resource-result-selector-container-pubs">
          <SecondaryButton
            className="resource-result-selector"
            onClick={() => selectPublication(publication)}
          >
            <div className="select-tagged-resource-icon">
              <TagResourceIcon />
            </div>
            Select
          </SecondaryButton>
        </div>
        <PublicationListItem noLink={true} publication={publication} />
      </div>
    );
  });
}

export async function submitPublicationPost(
  res,
  isTweeting,
  customPublicationErrors,
  setCustomPublicationErrors,
  pubSubmissionError,
  setPubSubmissionError,
  customPublication,
  setCustomPubSuccessfullyCreated,
  isQuickCreatingPub,
  setSubmittingPost,
  setPostSuccess,
  setResults,
  setIsQuickCreatingPub,
  setCustomPublication,
  selectedTopics,
  customPublicationAuthors,
  publication,
  hasHitMaxDailyPublications,
  customPubSuccessfullyCreated
) {
  if (customPublicationErrors) setCustomPublicationErrors();
  if (pubSubmissionError) setPubSubmissionError(false);
  if (customPubSuccessfullyCreated) setCustomPubSuccessfullyCreated(false);
  const submitCustomPublication = async () => {
    if (!isQuickCreatingPub) return false;
    const pubValidationErrors = await validateCustomPublication(
      customPublication
    );
    if (pubValidationErrors.length > 0) {
      setCustomPublicationErrors(pubValidationErrors);
      setSubmittingPost(false);
      return false;
    }
    return createCustomPublication(
      customPublication,
      customPublicationAuthors,
      undefined,
      undefined,
      () => {
        setPubSubmissionError(true);
        setSubmittingPost(false);
      },
      selectedTopics,
      undefined,
      undefined,
      hasHitMaxDailyPublications
    );
  };
  const customPublicationSubmissionResult = await submitCustomPublication();
  if (isQuickCreatingPub && !customPublicationSubmissionResult) return;

  if (isQuickCreatingPub) {
    const customPublicationWithID =
      customPublicationSubmissionResult.createdCustomPublication;
    customPublicationWithID.id = customPublicationSubmissionResult.id;
    res.publication = customPublicationWithID;
  } else
    res.publication = algoliaPublicationToDBPublicationListItem(publication);

  return submitCreatePostWithPublication(
    res,
    isTweeting,
    setPostSuccess,
    setSubmittingPost,
    setIsQuickCreatingPub,
    setCustomPublication,
    setCustomPubSuccessfullyCreated,
    selectedTopics,
    setResults
  );
}

export function submitCreatePostWithPublication(
  res,
  isTweeting,
  setPostSuccess,
  setSubmittingPost,
  setIsQuickCreatingPub,
  setCustomPublication,
  setCustomPubSuccessfullyCreated,
  selectedTopics,
  setResults
) {
  res.postType = {id: 'publicationPost', name: 'Publication'};
  res.topics = selectedTopics;
  createPost(res)
    .then((response) => {
      if (isTweeting) openTwitterWithPopulatedTweet(res.title, selectedTopics);
      setPostSuccess(true);
      setSubmittingPost(false);
      if (setResults) {
        const newPost = response.data;
        newPost.resourceType = POST;
        setResults((currentResults) => [newPost, ...currentResults]);
      }
    })
    .catch((err) => {
      if (setIsQuickCreatingPub) setIsQuickCreatingPub(false);
      if (setCustomPublication)
        setCustomPublication({
          title: '',
          url: '',
        });
      if (setCustomPubSuccessfullyCreated)
        setCustomPubSuccessfullyCreated(true);
      sortThrownCreatePostErrors(err);
      setSubmittingPost(false);
    });
}
