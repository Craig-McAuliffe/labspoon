import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import SubmitButton from '../../../Buttons/SubmitButton';
import PostTypeDropDown from './PostTypeDropDown';
import * as Yup from 'yup';
import {Form, Formik} from 'formik';
import FormTextInput from '../../../Forms/FormTextInput';

import './CreatePost.css';

export default function OpenPositionPostForm({
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
    position: '',
    location: '',
    salary: '',
    methods: '',
    startDate: '',
  };
  const validationSchema = Yup.object({
    mainContent: Yup.string().required('You need to write something!'),
    position: Yup.string().required(
      'You need to provide a link to the publication'
    ),
  });
  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitChanges}
      >
        <Form className="signin-form">
          <input
            name="mainContent"
            type="text"
            className="create-post-main-text"
          />
          <FormTextInput name="position" label="Position" />
          <FormTextInput name="location" label="Location" />
          <FormTextInput name="salary" label="Salary" />
          <FormTextInput name="methods" label="Methods" />
          <input type="date" name="startDate" label="Start Date" />
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
