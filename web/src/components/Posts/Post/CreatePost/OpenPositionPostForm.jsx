import React, {useContext} from 'react';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import FormTextInput, {CreatePostTextArea} from '../../../Forms/FormTextInput';
import FormDateInput from '../../../Forms/FormDateInput';
import PostForm from './PostForm';
import {handlePostTopics} from './PostForm';
import {CreatingPostContext} from './CreatePost';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function OpenPositionPostForm({cancelPost, setCreatingPost}) {
  const {selectedTopics, setPostSuccess} = useContext(CreatingPostContext);

  const submitChanges = (res) => {
    res.postType = {id: 'openPositionPost', name: 'Open Position'};
    const taggedTopics = handlePostTopics(selectedTopics);
    res.customTopics = taggedTopics.customTopics;
    res.topics = taggedTopics.DBTopics;
    createPost(res)
      .then(() => {
        setCreatingPost(false);
        setPostSuccess(true);
      })
      .catch((err) => alert(err));
  };
  const initialValues = {
    title: '',
    position: '',
    location: '',
    salary: '',
    methods: '',
    startDate: '',
  };
  const validationSchema = Yup.object({
    title: Yup.string().required('You need to write something!'),
    position: Yup.string().required(
      'You need to provide a link to the publication'
    ),
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
      <div className="creating-post-tags">
        <FormTextInput sideLabel={true} name="position" label="Position" />
        <FormTextInput sideLabel={true} name="location" label="Location" />
        <FormTextInput sideLabel={true} name="salary" label="Salary" />
        <FormTextInput sideLabel={true} name="methods" label="Methods" />
        <FormDateInput sideLabel={true} name="startDate" label="Start Date" />
      </div>
    </PostForm>
  );
}
