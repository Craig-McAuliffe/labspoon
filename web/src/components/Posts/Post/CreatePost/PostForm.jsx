import React, {useContext} from 'react';
import {Form, Formik} from 'formik';
import TagTopics from '../../../Topics/TagTopics';
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
  formID,
  algoliaFormSearch,
  outsideFormComponents,
}) {
  const {
    setSubmittingPost,
    submittingPost,
    setSelectedTopics,
    selectedTopics,
  } = useContext(CreatingPostContext);

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
          <Form id={formID}>{children}</Form>
        </Formik>
        {algoliaFormSearch}
        {outsideFormComponents}
        <TagTopics
          submittingForm={submittingPost}
          setSelectedTopics={setSelectedTopics}
          selectedTopics={selectedTopics}
          noCustomTopics={true}
        />
        <CreatePostActions
          postType={postType}
          setPostType={setPostType}
          formID={formID}
        />
      </div>
    </div>
  );
}
