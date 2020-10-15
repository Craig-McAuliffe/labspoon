import React, {useContext} from 'react';
import * as Yup from 'yup';
import firebase, {db} from '../../../../firebase';
import {v4 as uuid} from 'uuid';
import FormTextInput, {CreatePostTextArea} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import {SelectedTopicsContext} from './CreatePost';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function PublicationPostForm({
  cancelPost,
  setCreatingPost,
  setPostType,
  postType,
}) {
  const {selectedTopics} = useContext(SelectedTopicsContext);
  const submitChanges = (res) => {
    res.postType = {id: 'publicationPost', name: 'Publication'};
    selectedTopics.forEach((selectedTopic) => {
      if (selectedTopic.id === undefined) selectedTopic.id = uuid();
      if (selectedTopic.isNew) {
        db.doc(`topics/${selectedTopic.id}`).set(selectedTopic);
        delete selectedTopic.isNew;
      }
    });
    res.topics = selectedTopics;
    createPost(res)
      .then(() => {
        setCreatingPost(false);
        window.location.reload();
      })
      .catch((err) => alert(err));
  };

  const initialValues = {
    title: '',
    publicationURL: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('You need to write something!'),
    publicationURL: Yup.string()
      .required('You need to provide a link to the publication')
      .url(`This isn't a valid url`),
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
      <div className="creating-post-tags">
        <FormTextInput
          name="publicationURL"
          label="Publication Link"
          sideLabel={true}
        />
      </div>
    </PostForm>
  );
}
