import React, {useContext} from 'react';
import firebase from '../../../../firebase';
import PostForm from './PostForm';
import {
  CreatingPostContext,
  openTwitterWithPopulatedTweet,
  sortThrownCreatePostErrors,
} from './CreatePost';
import {initialValueNoTitle} from '../../../Forms/Articles/HeaderAndBodyArticleInput';

import './CreatePost.css';
import {checkRichTextForOpenPosLinkAndFetch} from './OpenPositionPostForm';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function DefaultPost({postTypeNameAndID}) {
  const {
    selectedTopics,
    setPostSuccess,
    setSubmittingPost,
    savedTitleText,
    setPostCreateDataResp,
  } = useContext(CreatingPostContext);
  const submitChanges = async (res, isTweeting) => {
    res.postType = postTypeNameAndID
      ? postTypeNameAndID
      : {id: 'defaultPost', name: 'Default'};
    res.topics = selectedTopics;
    const openPositionInText = await checkRichTextForOpenPosLinkAndFetch(
      res.title
    );
    if (openPositionInText) {
      res.postType = {id: 'openPositionPost', name: 'Open Position'};
      res.openPosition = openPositionInText;
    }
    createPost(res)
      .then((response) => {
        if (isTweeting)
          openTwitterWithPopulatedTweet(res.title, selectedTopics);
        setPostCreateDataResp(response.data);
        setPostSuccess(true);
        setSubmittingPost(false);
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
    <>
      <PostForm
        onSubmit={submitChanges}
        initialValues={initialValues}
        formID="create-default-post-form"
      />
    </>
  );
}
