import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import CreatePostActions from './CreatePostActions';
import {CreatingPostContext, validateTweetPostLength} from './CreatePost';
import './CreatePost';
import {Alert} from 'react-bootstrap';
import {yupRichBodyOnlyValidation} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import * as Yup from 'yup';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';

const postValidationSchema = Yup.object({
  title: yupRichBodyOnlyValidation(),
});

export const CreatePostTitleContext = React.createContext();

export default function PostForm({onSubmit, initialValues, formID}) {
  const {
    setSubmittingPost,
    submittingPost,
    selectedTopics,
    postType,
    setPostType,
  } = useContext(CreatingPostContext);
  const [isTweeting, setIsTweeting] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [isTweetTooLong, setIsTweetTooLong] = useState();

  useEffect(() => {
    if (isTweeting)
      setIsTweetTooLong(!validateTweetPostLength(titleLength, selectedTopics));
  }, [selectedTopics, titleLength]);

  const createPost = (res) => {
    if (submittingPost) return;
    setSubmittingPost(true);
    onSubmit(res, isTweeting);
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={postValidationSchema}
        onSubmit={createPost}
      >
        <Form id={formID ? formID : 'create-post-form'}>
          <CreatePostTitleContext.Provider
            value={{
              setTitleLength: setTitleLength,
              titleLength: titleLength,
            }}
          >
            <CreatePostTextArea name="title" />
          </CreatePostTitleContext.Provider>
        </Form>
      </Formik>
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
    </>
  );
}
