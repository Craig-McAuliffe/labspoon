import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import SubmitButton from '../../../Buttons/SubmitButton';
import PostTypeDropDown from './PostTypeDropDown';
import {Form, Formik} from 'formik';
import {FormTextArea} from '../../../Forms/FormTextInput';
import * as Yup from 'yup';

import './CreatePost.css';

export default function DefaultPost({
  cancelPost,
  setPostType,
  postType,
  setCreatingPost,
}) {
  const submitChanges = () => {
    setCreatingPost(false);
  };
  const initialValues = {
    mainContent: '',
  };
  const validationSchema = Yup.object({
    mainContent: Yup.string().required('You need to write something!'),
  });

  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitChanges}
      >
        <Form>
          <div className="creating-post-main-text-container">
            <FormTextArea name="mainContent" />
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
