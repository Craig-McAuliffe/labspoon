import React from 'react';
import * as Yup from 'yup';
import FormTextInput, {CreatePostTextArea} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import firebase from '../../../../firebase';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function PublicationPostForm({
  cancelPost,
  setCreatingPost,
  setPostType,
  postType,
}) {
  const submitChanges = (res) => {
    res.postType = {id: 'publicationPost', name: 'Publication Post'};
    createPost(res)
      .then(() => setCreatingPost(false))
      .catch((err) => alert(err));
  };

  const initialValues = {
    title: '',
    publicationURL: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('You need to write something!'),
    publicationURL: Yup.string()
      .required('You need to provide a link to the publication')
      .url(`This isn't a valid url`),
  });

  return (
    <div className="creating-post-container">
      <PostForm
        onSubmit={submitChanges}
        initialValues={initialValues}
        validationSchema={validationSchema}
        cancelPost={cancelPost}
        postType={postType}
        setPostType={setPostType}
      >
        <CreatePostTextArea name="title" />
        <div className="creating-post-tags">
          <FormTextInput
            name="publicationURL"
            label="Publication Link"
            sideLabel={true}
          />
        </div>
      </PostForm>
    </div>
  );
}
