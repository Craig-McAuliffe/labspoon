import React, {useContext} from 'react';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import FormTextInput, {CreatePostTextArea} from '../../../Forms/FormTextInput';
import FormDateInput from '../../../Forms/FormDateInput';
import PostForm from './PostForm';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {handlePostTopics} from './PostForm';
import {CreatingPostContext} from './CreatePost';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function OpenPositionPostForm({
  setCreatingPost,
  postType,
  setPostType,
}) {
  const {selectedTopics, setPostSuccess, setSubmittingPost} = useContext(
    CreatingPostContext
  );

  const submitChanges = (res) => {
    res.postType = {id: 'openPositionPost', name: 'Open Position'};
    const taggedTopics = handlePostTopics(selectedTopics);
    res.customTopics = taggedTopics.customTopics;
    res.topics = taggedTopics.DBTopics;
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
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
      <TypeOfTaggedResourceDropDown
        setTaggedResourceType={setPostType}
        taggedResourceType={postType}
      />
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
