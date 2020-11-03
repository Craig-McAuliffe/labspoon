import React, {useContext} from 'react';
import {Form, Formik} from 'formik';
import TagTopics from './TagTopics';
import CreatePostActions from './CreatePostActions';
import {CreatingPostContext} from './CreatePost';
import './CreatePost';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';

export default function PostForm({
  children,
  onSubmit,
  initialValues,
  validationSchema,
  postType,
  setPostType,
}) {
  const {setSubmittingPost, submittingPost} = useContext(CreatingPostContext);

  const createPost = (res) => {
    if (submittingPost) return;
    setSubmittingPost(true);
    onSubmit(res);
  };

  return (
    <div className="creating-post-container">
      {submittingPost ? (
        <div className="create-post-loading-spinner">
          <LoadingSpinner />
        </div>
      ) : null}
      <div className={submittingPost ? 'create-post-loading-greyed-out' : null}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={createPost}
        >
          <Form id="create-post-form">{children}</Form>
        </Formik>
        <TagTopics submittingPost={submittingPost} />
        <CreatePostActions postType={postType} setPostType={setPostType} />
      </div>
    </div>
  );
}

export function handlePostTopics(selectedTopics) {
  const customTopics = [];
  const DBTopics = [];
  selectedTopics.forEach((selectedTopic) => {
    if (selectedTopic.isCustom) {
      customTopics.push({name: selectedTopic.name});
    } else DBTopics.push(selectedTopic);
  });
  return {customTopics: customTopics, DBTopics: DBTopics};
}
