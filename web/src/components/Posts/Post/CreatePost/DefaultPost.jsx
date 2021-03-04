import React, {useContext} from 'react';
import firebase from '../../../../firebase';
import * as Yup from 'yup';
import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import {
  CreatingPostContext,
  openTwitterWithPopulatedTweet,
  sortThrownCreatePostErrors,
} from './CreatePost';
import {handlePostTopics} from '../../../Topics/TagTopics';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {FilterableResultsContext} from '../../../FilterableResults/FilterableResults';
import {POST} from '../../../../helpers/resourceTypeDefinitions';
import {
  initialValueNoTitle,
  yupPostValidation,
} from '../../../Forms/Articles/HeaderAndBodyArticleInput';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export const postValidationSchema = Yup.object({
  title: yupPostValidation,
});

export default function DefaultPost({setCreatingPost, postType, setPostType}) {
  const {
    selectedTopics,
    setPostSuccess,
    setSubmittingPost,
    savedTitleText,
  } = useContext(CreatingPostContext);
  const {setResults} = useContext(FilterableResultsContext);
  const submitChanges = (res, isTweeting) => {
    res.postType = {id: 'defaultPost', name: 'Default'};
    const taggedTopics = handlePostTopics(selectedTopics);
    res.customTopics = taggedTopics.customTopics;
    res.topics = taggedTopics.DBTopics;
    createPost(res)
      .then((response) => {
        if (isTweeting)
          openTwitterWithPopulatedTweet(res.title, selectedTopics);
        setCreatingPost(false);
        setPostSuccess(true);
        setSubmittingPost(false);
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
    title: savedTitleText ? savedTitleText : initialValueNoTitle,
  };

  return (
    <PostForm
      onSubmit={submitChanges}
      initialValues={initialValues}
      validationSchema={postValidationSchema}
      formID="create-default-post-form"
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
