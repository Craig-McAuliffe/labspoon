import React, {useContext, useState} from 'react';
import NegativeButton from '../../../Buttons/NegativeButton';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import {CreatePostTextArea, TextInput} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import {CreatingPostContext, sortThrownCreatePostErrors} from './CreatePost';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import PublicationListItem, {
  SmallPublicationListItem,
} from '../../../Publication/PublicationListItem';
import {FindAndAddUsersToForm} from '../../../Forms/AddUserToForm';
import {
  SelectedAuthors,
  createCustomPublication,
} from '../../../Publication/CreateCustomPublication';
import {AuthContext} from '../../../../App';
import {
  PublicationIcon,
  TagResourceIcon,
} from '../../../../assets/ResourceTypeIcons';
import {
  DropDownTriangle,
  InvertedDropDownTriangle,
} from '../../../../assets/GeneralActionIcons';
import InputError from '../../../Forms/InputError';
import ErrorMessage from '../../../Forms/ErrorMessage';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import SecondaryButton from '../../../Buttons/SecondaryButton';
import './CreatePost.css';
import {algoliaPublicationToDBPublicationListItem} from '../../../../helpers/publications';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function PublicationPostForm({
  setCreatingPost,
  postType,
  setPostType,
}) {
  const {userProfile} = useContext(AuthContext);
  const {selectedTopics, setSubmittingPost, setPostSuccess} = useContext(
    CreatingPostContext
  );
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

  const submitChanges = async (res) => {
    setCustomPublicationErrors();
    setPubSubmissionError(false);

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
        },
        selectedTopics,
        undefined,
        undefined
      );
    };
    const customPublicationSubmissionResult = await submitCustomPublication();
    if (isQuickCreatingPub && !customPublicationSubmissionResult) return;

    if (!isQuickCreatingPub && !publication) {
      alert('You must select a publication or create one');
      setSubmittingPost(false);
      return false;
    }
    if (isQuickCreatingPub) {
      const customPublicationWithID =
        customPublicationSubmissionResult.createdCustomPublication;
      customPublicationWithID.id = customPublicationSubmissionResult.id;
      res.publication = customPublicationWithID;
    } else
      res.publication = algoliaPublicationToDBPublicationListItem(publication);
    res.postType = {id: 'publicationPost', name: 'Publication'};
    res.topics = selectedTopics;
    createPost(res)
      .then(() => {
        setCreatingPost(false);
        setPostSuccess(true);
        setSubmittingPost(false);
      })
      .catch((err) => {
        sortThrownCreatePostErrors(err);
        setSubmittingPost(false);
      });
  };

  const initialValues = {
    title: '',
  };

  const postTitleValidation = Yup.string()
    .required('You need to write something!')
    .max(
      1500,
      'Your post is too long. It must have fewer than 1500 characters.'
    );
  const validationSchema = Yup.object({
    title: postTitleValidation,
  });

  return (
    <>
      <PostForm
        onSubmit={submitChanges}
        initialValues={initialValues}
        validationSchema={validationSchema}
        formID="create-publication-post-form"
        outsideFormComponents={
          isQuickCreatingPub && (
            <PostQuickCreatePub
              customPublicationAuthors={customPublicationAuthors}
              setCustomPublicationAuthors={setCustomPublicationAuthors}
              customPublication={customPublication}
              setCustomPublication={setCustomPublication}
              userID={userProfile.id}
              customPublicationErrors={customPublicationErrors}
              pubSubmissionError={pubSubmissionError}
            />
          )
        }
      >
        <div className="creating-post-main-text-container">
          <CreatePostTextArea name="title" />
        </div>
        <TypeOfTaggedResourceDropDown
          setTaggedResourceType={setPostType}
          taggedResourceType={postType}
        />
        <SelectPublication
          publication={publication}
          setPublication={setPublication}
          isQuickCreatingPub={isQuickCreatingPub}
          setIsQuickCreatingPub={setIsQuickCreatingPub}
        />
      </PostForm>
    </>
  );
}

function SelectPublication({
  publication,
  setPublication,
  setIsQuickCreatingPub,
  isQuickCreatingPub,
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
      {!isQuickCreatingPub &&
        displayedPublications &&
        displayedPublications.length > 0 && (
          <PublicationSearchResults
            publications={displayedPublications}
            setTaggedPublication={setPublication}
          />
        )}

      <div className="create-post-alt-tagging-method-container">
        <button className="create-publication-search-publications-button"></button>
        <p>
          {isQuickCreatingPub
            ? ''
            : "Can't find the publication you're looking for?"}
        </p>
        <button
          onClick={() => {
            setIsQuickCreatingPub(!isQuickCreatingPub);
          }}
          className="create-pub-post-quick-create-toggle"
          type="button"
        >
          {isQuickCreatingPub ? (
            <>
              <h4>Switch Back</h4>
              <InvertedDropDownTriangle />
            </>
          ) : (
            <>
              <h4>Quick Add</h4>
              <DropDownTriangle />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PostQuickCreatePub({
  customPublicationAuthors,
  setCustomPublicationAuthors,
  customPublication,
  setCustomPublication,
  userID,
  customPublicationErrors,
  pubSubmissionError,
}) {
  const removeAuthor = (author) => {
    setCustomPublicationAuthors((currentAuthors) =>
      currentAuthors.filter((currentAuthor) => currentAuthor !== author)
    );
  };

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
        <FindAndAddUsersToForm
          onUserSelect={(user) =>
            setCustomPublicationAuthors((existingAuthors) => [
              ...existingAuthors,
              user,
            ])
          }
          searchBarLabel="Add authors on Labspoon"
        />
        <SelectedAuthors
          authors={customPublicationAuthors}
          removeAuthor={removeAuthor}
          exceptionID={userID}
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
