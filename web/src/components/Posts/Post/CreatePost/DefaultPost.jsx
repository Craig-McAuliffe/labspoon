import React, {useContext} from 'react';
import firebase from '../../../../firebase';
import * as Yup from 'yup';
import {v4 as uuid} from 'uuid';
import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import {SelectedTopicsContext} from './CreatePost';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function DefaultPost({
  cancelPost,
  setPostType,
  postType,
  setCreatingPost,
}) {
  const {selectedTopics} = useContext(SelectedTopicsContext);

  const submitChanges = (res) => {
    selectedTopics.forEach((selectedTopic) => {
      if (selectedTopic.id === undefined) selectedTopic.id = uuid();
    });
    res.postType = {id: 'defaultPost', name: 'Default Post'};
    res.topics = selectedTopics;
    createPost(res)
      .then(() => setCreatingPost(false))
      .catch((err) => alert(err));
  };
  const initialValues = {
    title: '',
  };
  const validationSchema = Yup.object({
    title: Yup.string().required('You need to write something!'),
  });
  return (
    <PostForm
      onSubmit={submitChanges}
      initialValues={initialValues}
      validationSchema={validationSchema}
      cancelPost={cancelPost}
      postType={postType}
      setPostType={setPostType}
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
    </PostForm>
  );
}
