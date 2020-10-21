import React, {useState, useEffect} from 'react';
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
  const [postSubmitted, setPostSubmitted] = useState(false);

  useEffect(() => {
    if (postSubmitted) {
      setTimeout(() => setPostSubmitted(false), 10000);
    }
  }, [postSubmitted]);

  const createPost = (res) => {
    setPostSubmitted(true);
    if (postSubmitted) return;
    onSubmit(res);
  };

  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={createPost}
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
