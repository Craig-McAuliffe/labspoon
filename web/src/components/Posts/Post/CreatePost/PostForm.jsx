import React from 'react';
import {Form, Formik} from 'formik';
import TagTopics from './TagTopics';
import CreatePostActions from './CreatePostActions';
import './CreatePost';

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
        <Form id="create-post-form">{children}</Form>
      </Formik>
      <TagTopics />
      <CreatePostActions
        cancelPost={cancelPost}
        postType={postType}
        setPostType={setPostType}
      />
    </div>
  );
}
