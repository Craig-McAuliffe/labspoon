import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import SubmitButton from '../../../Buttons/SubmitButton';
import PostTypeDropDown from './PostTypeDropDown';
import * as Yup from 'yup';
import {Form, Formik} from 'formik';
import FormTextInput, {CreatePostTextArea} from '../../../Forms/FormTextInput';
import firebase from '../../../../firebase';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function PublicationPostForm({
  cancelPost,
  setCreatingPost,
  setPostType,
  postType,
}) {
  const submitChanges = (res) => {
    res.postType = {id: 'publicationPost', name: 'Publication Post'};
    createPost(res)
      .then(() => setCreatingPost(false))
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
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitChanges}
      >
        <Form className="signin-form">
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
          <div className="create-post-actions">
            <div className="create-post-cancel-container">
              <CancelButton cancelAction={cancelPost} />
            </div>
            <div className="create-post-actions-positive">
              <PostTypeDropDown setPostType={setPostType} postType={postType} />
              <SubmitButton inputText="Submit" />
            </div>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
