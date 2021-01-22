import React, {useContext} from 'react';
import firebase from '../../../../firebase';
import * as Yup from 'yup';
import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import {CreatingPostContext} from './CreatePost';
import {handlePostTopics} from '../../../Topics/TagTopics';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function DefaultPost({setCreatingPost, postType, setPostType}) {
  const {selectedTopics, setPostSuccess, setSubmittingPost} = useContext(
    CreatingPostContext
  );

  const submitChanges = (res) => {
    res.postType = {id: 'defaultPost', name: 'Default'};
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
    </PostForm>
  );
}
