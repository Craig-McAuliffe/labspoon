import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import PostTypeDropDown from './PostTypeDropDown';
import {Form, Formik} from 'formik';

export default function PostForm({
  children,
  onSubmit,
  initialValues,
  validationSchema,
  cancelPost,
  postType,
  setPostType,
}) {
  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <div className="creating-post-main-text-container">{children}</div>
          <div className="create-post-actions">
            <div className="create-post-cancel-container">
              <CancelButton cancelAction={cancelPost} />
            </div>
            <div className="create-post-actions-positive">
              <PostTypeDropDown setPostType={setPostType} postType={postType} />
              <PrimaryButton submit={true}>Post</PrimaryButton>
            </div>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
