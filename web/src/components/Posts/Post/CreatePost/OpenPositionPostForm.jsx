import React, {useContext, useEffect, useState} from 'react';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {handlePostTopics} from '../../../Topics/TagTopics';
import {CreatingPostContext, sortThrownCreatePostErrors} from './CreatePost';
import {Link} from 'react-router-dom';

import './CreatePost.css';
import {ReducedOpenPositionListItem} from '../../../OpenPosition/OpenPositionListItem';
import NegativeButton from '../../../Buttons/NegativeButton';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import InputError from '../../../Forms/InputError';
import SecondaryButton from '../../../Buttons/SecondaryButton';
import {TagResourceIcon} from '../../../../assets/ResourceTypeIcons';
import {algoliaOpenPosToDBOpenPosListItem} from '../../../../helpers/openPositions';
import {FilterableResultsContext} from '../../../FilterableResults/FilterableResults';
import {POST} from '../../../../helpers/resourceTypeDefinitions';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function OpenPositionPostForm({
  setCreatingPost,
  postType,
  setPostType,
}) {
  const {
    selectedTopics,
    setPostSuccess,
    setSubmittingPost,
    savedTitleText,
  } = useContext(CreatingPostContext);
  const [taggedOpenPosition, setTaggedOpenPosition] = useState();
  const [noTaggedOpenPosError, setNoTaggedOpenPosError] = useState(false);
  const [generalError, setGeneralError] = useState(false);
  const {setResults} = useContext(FilterableResultsContext);

  useEffect(() => {
    if (taggedOpenPosition && noTaggedOpenPosError)
      setNoTaggedOpenPosError(false);
  }, [taggedOpenPosition]);

  useEffect(() => {
    if (!generalError) return;
    alert(
      'Something went wrong while creating your post. Sorry about that. Please try again and contact support if the problem persists.'
    );
    setGeneralError(false);
  }, [generalError]);

  const submitChanges = async (res) => {
    setSubmittingPost(true);
    if (!taggedOpenPosition) {
      setNoTaggedOpenPosError(true);
      setSubmittingPost(false);
      return;
    }
    res.postType = {id: 'openPositionPost', name: 'Open Position'};
    const taggedTopics = handlePostTopics(selectedTopics);
    res.customTopics = taggedTopics.customTopics;
    res.topics = taggedTopics.DBTopics;
    const dbOpenPosition = algoliaOpenPosToDBOpenPosListItem(
      taggedOpenPosition
    );
    dbOpenPosition.id = taggedOpenPosition.id;
    res.openPosition = dbOpenPosition;
    createPost(res)
      .then((response) => {
        setCreatingPost(false);
        setSubmittingPost(false);
        setPostSuccess(true);
        if (setResults) {
          const newPost = response.data;
          newPost.resourceType = POST;
          setResults((currentResults) => [newPost, ...currentResults]);
        }
      })
      .catch((err) => {
        sortThrownCreatePostErrors(err);
        setSubmittingPost(false);
      });
  };
  const initialValues = {
    title: savedTitleText ? savedTitleText : '',
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('You need to write something!')
      .max(
        1500,
        'Your post is too long. It must have fewer than 1500 characters.'
      ),
  });
  return (
    <PostForm
      onSubmit={submitChanges}
      initialValues={initialValues}
      validationSchema={validationSchema}
      formID="create-openPosition-post-form"
      algoliaFormSearch={
        <SelectOpenPosition
          setTaggedOpenPosition={setTaggedOpenPosition}
          taggedOpenPosition={taggedOpenPosition}
          noTaggedOpenPosError={noTaggedOpenPosError}
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
  );
}

function SelectOpenPosition({
  setTaggedOpenPosition,
  taggedOpenPosition,
  noTaggedOpenPosError,
}) {
  const [displayedOpenPositions, setDisplayedOpenPositions] = useState([]);
  if (taggedOpenPosition) {
    return (
      <div className="tagged-resource-section">
        <ReducedOpenPositionListItem
          openPosition={taggedOpenPosition}
          noLink={true}
        />
        <div className="create-post-deselect-resource-container">
          <NegativeButton
            onClick={() => {
              setTaggedOpenPosition(undefined);
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
    <>
      <div className="tagged-resource-section">
        <h4>Search Open Positions</h4>
        <div className="resource-search-input-container">
          <FormDatabaseSearch
            setDisplayedItems={setDisplayedOpenPositions}
            indexName="_OPENPOSITIONS"
            placeholderText=""
            displayedItems={displayedOpenPositions}
            clearListOnNoResults={true}
            hasCustomContainer={true}
            hideSearchIcon={true}
          />
        </div>
      </div>
      <div className="create-post-alt-tagging-method-container">
        <h4>
          Haven&#39;t made one yet?{' '}
          <Link to="/create/openPosition">Create an Open Position now</Link>
        </h4>
      </div>
      {noTaggedOpenPosError && (
        <InputError error="You need to tag an open position" />
      )}
      {displayedOpenPositions && displayedOpenPositions.length > 0 && (
        <OpenPositionsSearchResults
          openPositions={displayedOpenPositions}
          setTaggedOpenPosition={setTaggedOpenPosition}
        />
      )}
    </>
  );
}

function OpenPositionsSearchResults({openPositions, setTaggedOpenPosition}) {
  const selectOpenPosition = (openPosition) => {
    setTaggedOpenPosition(openPosition);
  };
  return openPositions.map((openPosition) => {
    if (!openPosition.objectID) return null;
    openPosition.id = openPosition.objectID;
    return (
      <div
        key={openPosition.id}
        className="resource-result-with-selector-container"
      >
        <div className="resource-result-selector-container">
          <SecondaryButton
            className="resource-result-selector"
            onClick={() => selectOpenPosition(openPosition)}
          >
            <div className="select-tagged-resource-icon">
              <TagResourceIcon />
            </div>
            Select
          </SecondaryButton>
        </div>
        <ReducedOpenPositionListItem
          noLink={true}
          openPosition={openPosition}
          decreasedEmphasis={true}
        />
      </div>
    );
  });
}
