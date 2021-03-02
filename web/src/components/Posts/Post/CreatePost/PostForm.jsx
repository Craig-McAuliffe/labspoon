import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import TagTopics from '../../../Topics/TagTopics';
import CreatePostActions from './CreatePostActions';
import {
  CreatingPostContext,
  getTweetPostURL,
  validateTweetPostLength,
} from './CreatePost';
import './CreatePost';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import {Alert} from 'react-bootstrap';

export const CreatePostTitleContext = React.createContext();
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
  const [isTweeting, setIsTweeting] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [isTweetTooLong, setIsTweetTooLong] = useState();

  const createPost = (res) => {
    if (submittingPost) return;
    setSubmittingPost(true);
    if (isTweeting)
      window.open(getTweetPostURL(res.title, selectedTopics), '_blank');
    onSubmit(res);
  };

  useEffect(() => {
    if (isTweeting)
      setIsTweetTooLong(!validateTweetPostLength(titleLength, selectedTopics));
  }, [selectedTopics, titleLength]);

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
          <Form id={formID}>
            <CreatePostTitleContext.Provider
              value={{setTitleLength: setTitleLength}}
            >
              {children}
            </CreatePostTitleContext.Provider>
          </Form>
        </Formik>
        {algoliaFormSearch}
        {outsideFormComponents}
        <TagTopics
          submittingForm={submittingPost}
          setSelectedTopics={setSelectedTopics}
          selectedTopics={selectedTopics}
          noCustomTopics={true}
        />
        {isTweetTooLong && isTweeting && (
          <Alert variant="warning">
            The combined length of the topics and text are too big for a single
            tweet
          </Alert>
        )}
        <CreatePostActions
          postType={postType}
          setPostType={setPostType}
          formID={formID}
          setIsTweeting={setIsTweeting}
          isTweeting={isTweeting}
          hasTweetOption={true}
        />
      </div>
    </div>
  );
}
