import React, {useContext} from 'react';
import firebase from '../../../../firebase';
import * as Yup from 'yup';
import {addTaggedTopicToDB} from './TagTopics';
import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import {CreatingPostContext} from './CreatePost';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function DefaultPost({cancelPost, setCreatingPost}) {
  const {selectedTopics, setPostSuccess} = useContext(CreatingPostContext);

  const submitChanges = (res) => {
    res.postType = {id: 'defaultPost', name: 'Default'};
    selectedTopics.forEach((selectedTopic) => {
      addTaggedTopicToDB(selectedTopic);
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
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
    </PostForm>
  );
}
