import React, {useContext, useState} from 'react';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {handlePostTopics} from '../../../Topics/TagTopics';
import {CreatingPostContext} from './CreatePost';
import {Link} from 'react-router-dom';

import './CreatePost.css';
import {SmallOpenPositionListItem} from '../../../OpenPosition/OpenPositionListItem';
import NegativeButton from '../../../Buttons/NegativeButton';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import InputError from '../../../Forms/InputError';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function OpenPositionPostForm({
  setCreatingPost,
  postType,
  setPostType,
}) {
  const {selectedTopics, setPostSuccess, setSubmittingPost} = useContext(
    CreatingPostContext
  );
  const [taggedOpenPosition, setTaggedOpenPosition] = useState();
  const [noTaggedOpenPosError, setNoTaggedOpenPosError] = useState(false);

  const submitChanges = (res) => {
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
    res.openPosition = taggedOpenPosition;
    createPost(res)
      .then(() => {
        setCreatingPost(false);
        setPostSuccess(true);
        setSubmittingPost(false);
      })
      .catch((err) => {
        console.log(err);
        alert(
          'Oh dear, something went wrong trying to create your post. Please try again later.'
        );
        setSubmittingPost(false);
      });
  };
  const initialValues = {
    title: '',
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
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
      <TypeOfTaggedResourceDropDown
        setTaggedResourceType={setPostType}
        taggedResourceType={postType}
      />
      <SelectOpenPosition
        setTaggedOpenPosition={setTaggedOpenPosition}
        taggedOpenPosition={taggedOpenPosition}
        noTaggedOpenPosError={noTaggedOpenPosError}
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
      <div>
        <SmallOpenPositionListItem openPosition={taggedOpenPosition} />
        <div>
          <NegativeButton
            onClick={() => {
              setQuery(undefined);
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
      <div className="tagged-resource-search-container">
        <h4>Search Open Positions</h4>
        <div className="resource-search-input-container">
          <FormDatabaseSearch
            setDisplayedItems={setDisplayedOpenPositions}
            indexName="_OPEN_POSITIONS"
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
          <Link to="/create">Create an Open Position now</Link>
        </h4>
      </div>
      {noTaggedOpenPosError && (
        <InputError error="You need to tag an open position" />
      )}
    </>
  );
}
