import React from 'react';
import firebase from '../../../../firebase';

import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import * as Yup from 'yup';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function DefaultPost({
  cancelPost,
  setPostType,
  postType,
  setCreatingPost,
}) {
  const submitChanges = (res) => {
    res.postType = {id: 'defaultPost', name: 'Default'};
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
