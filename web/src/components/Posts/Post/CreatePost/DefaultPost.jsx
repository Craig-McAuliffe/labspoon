import React, {useContext, useState, useEffect} from 'react';
import firebase, {db} from '../../../../firebase';
import * as Yup from 'yup';
import {v4 as uuid} from 'uuid';
import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import {CreatingPostContext} from './CreatePost';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function DefaultPost({
  cancelPost,
  setPostType,
  postType,
  setCreatingPost,
}) {
  const {selectedTopics, setPostSuccess} = useContext(CreatingPostContext);
  const [postSubmitted, setPostSubmitted] = useState(false);

  useEffect(() => {
    if (postSubmitted) {
      setTimeout(() => setPostSubmitted(false), 10000);
    }
  }, [postSubmitted]);

  const submitChanges = (res) => {
    setPostSubmitted(true);
    if (postSubmitted) return;
    res.postType = {id: 'defaultPost', name: 'Default'};
    selectedTopics.forEach((selectedTopic) => {
      if (selectedTopic.id === undefined) selectedTopic.id = uuid();
      if (selectedTopic.isNew) {
        delete selectedTopic.isNew;
        db.doc(`topics/${selectedTopic.id}`).set(selectedTopic);
      }
    });
    res.topics = selectedTopics;
    createPost(res)
      .then(() => {
        setCreatingPost(false);
        setPostSuccess(true);
      })
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
