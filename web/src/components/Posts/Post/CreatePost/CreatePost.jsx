import React, {useState, useContext, createContext, useEffect} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import PublicationPostForm from './PublicationPostForm';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';

import './CreatePost.css';

export const DEFAULT_POST = 'Default';
export const PUBLICATION_POST = 'Publication';
export const OPEN_POSITION_POST = 'Open Position';

export const CreatingPostContext = createContext();

export default function CreatePost({
  pinnedPost,
  keepExpanded = false,
  redirect = undefined,
}) {
  const {user} = useContext(AuthContext);
  const [creatingPost, setCreatingPost] = useState(keepExpanded);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [postSuccess, setPostSuccess] = useState(false);
  const [taggedResourceType, setTaggedResourceType] = useState(DEFAULT_POST);
  const [submittingPost, setSubmittingPost] = useState(false);

  const setCreatingPostIfNotExpanded = (newValue) => {
    if (!keepExpanded) setCreatingPost(newValue);
  };

  const cancelPost = () => {
    if (submittingPost) return;
    if (!keepExpanded) setCreatingPostIfNotExpanded(false);
  };

  useEffect(() => {
    setTimeout(() => setPostSuccess(false), 3000);
  }, [postSuccess]);

  useEffect(() => {
    setSelectedTopics([]);
  }, [creatingPost]);

  if (postSuccess && redirect) {
    return redirect;
  }

  if (!user) return null;
  if (creatingPost)
    return (
      <CreatingPostContext.Provider
        value={{
          selectedTopics: selectedTopics,
          setSelectedTopics: setSelectedTopics,
          setPostSuccess: setPostSuccess,
          submittingPost: submittingPost,
          setSubmittingPost: setSubmittingPost,
          cancelPost: keepExpanded ? undefined : cancelPost,
        }}
      >
        <PostTypeSpecificForm
          setCreatingPost={setCreatingPostIfNotExpanded}
          postType={taggedResourceType}
          setPostType={setTaggedResourceType}
        />
      </CreatingPostContext.Provider>
    );
  else
    return pinnedPost ? (
      <button
        onClick={() => setCreatingPost(true)}
        className="create-pinned-post-button"
      >
        <WriteIcon />
        <h3>Create Pinned Post</h3>
      </button>
    ) : (
      <div className="not-creating-post-container">
        <button onClick={() => setCreatingPost(true)}>
          <WriteIcon />
          <p className="not-creating-post-text">Post to your followers...</p>
        </button>
        {postSuccess ? (
          <h4 className="post-success-message">Post Created!</h4>
        ) : null}
      </div>
    );
}

function PostTypeSpecificForm({setCreatingPost, postType, setPostType}) {
  switch (postType) {
    case DEFAULT_POST:
      return (
        <DefaultPost
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case PUBLICATION_POST:
      return (
        <PublicationPostForm
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    default:
      return (
        <DefaultPost
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
  }
}
