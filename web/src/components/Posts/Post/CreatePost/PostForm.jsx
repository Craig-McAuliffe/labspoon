import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import TagTopics from '../../../Topics/TagTopics';
import CreatePostActions from './CreatePostActions';
import {CreatingPostContext, validateTweetPostLength} from './CreatePost';
import './CreatePost';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import {Alert} from 'react-bootstrap';
import {yupRichBodyOnlyValidation} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import * as Yup from 'yup';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {CreatePostBackgroundSwirl} from '../../../../assets/Designs';

const postValidationSchema = Yup.object({
  title: yupRichBodyOnlyValidation(),
});

export const CreatePostTitleContext = React.createContext();
export default function PostForm({children, onSubmit, initialValues, formID}) {
  const {
    setSubmittingPost,
    submittingPost,
    setSelectedTopics,
    selectedTopics,
    postType,
    setPostType,
  } = useContext(CreatingPostContext);
  const [isTweeting, setIsTweeting] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [isTweetTooLong, setIsTweetTooLong] = useState();

  const createPost = (res) => {
    if (submittingPost) return;
    setSubmittingPost(true);
    onSubmit(res, isTweeting);
  };

  useEffect(() => {
    if (isTweeting)
      setIsTweetTooLong(!validateTweetPostLength(titleLength, selectedTopics));
  }, [selectedTopics, titleLength]);

  return (
    <>
      <h2 className="create-post-section-title">
        What topic are you posting about?
      </h2>
      <TagTopics
        submittingForm={submittingPost}
        setSelectedTopics={setSelectedTopics}
        selectedTopics={selectedTopics}
        largeDesign={true}
      />
      <div className="create-post-hidden-overlap">
        {selectedTopics.length > 0 && (
          <>
            <h2 className="create-post-section-title-2">
              What type of post is this?
            </h2>
            <TypeOfTaggedResourceDropDown
              setTaggedResourceType={setPostType}
              taggedResourceType={postType}
            />
          </>
        )}
        {postType ? (
          <div className="creating-post-container">
            {submittingPost ? (
              <div className="create-post-loading-spinner">
                <LoadingSpinner />
              </div>
            ) : null}
            <div
              className={
                submittingPost ? 'create-post-loading-greyed-out' : null
              }
            >
              <Formik
                initialValues={initialValues}
                validationSchema={postValidationSchema}
                onSubmit={createPost}
              >
                <Form id={formID}>
                  <CreatePostTitleContext.Provider
                    value={{
                      setTitleLength: setTitleLength,
                      titleLength: titleLength,
                    }}
                  >
                    <div className="creating-post-main-text-container">
                      <CreatePostTextArea name="title" />
                    </div>
                  </CreatePostTitleContext.Provider>
                </Form>
              </Formik>
              {isTweetTooLong && isTweeting && (
                <Alert variant="warning">
                  The combined length of the topics and text are too big for a
                  single tweet
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
        ) : (
          <div className="create-post-background-swirl-container">
            <CreatePostBackgroundSwirl />
          </div>
        )}
      </div>
    </>
  );
}
