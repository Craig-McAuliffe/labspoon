import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import SubmitButton from '../../../Buttons/SubmitButton';
import PostTypeDropDown from './PostTypeDropDown';
import * as Yup from 'yup';
import {Form, Formik} from 'formik';
import FormTextInput, {FormTextArea} from '../../../Forms/FormTextInput';

import './CreatePost.css';

export default function PublicationPostForm({
  cancelPost,
  setCreatingPost,
  setPostType,
  postType,
}) {
  const submitChanges = () => {
    setCreatingPost(false);
  };

  const initialValues = {
    mainContent: '',
    publicationURL: '',
  };

  const validationSchema = Yup.object({
    mainContent: Yup.string().required('You need to write something!'),
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
            <FormTextArea name="mainContent" />
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
