import React, {useState, useContext, createContext, useEffect} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import OpenPositionPostForm from './OpenPositionPostForm';
import PublicationPostForm from './PublicationPostForm';
import PostTypeDropDown from './PostTypeDropDown';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';

import './CreatePost.css';

const DEFAULT_POST = 'Default';
const PUBLICATION_POST = 'Publication';
const OPEN_POSITION_POST = 'Open Position';

export const CreatingPostContext = createContext();

export default function CreatePost({pinnedPost}) {
  const {user} = useContext(AuthContext);
  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postType, setPostType] = useState(DEFAULT_POST);
  const [submittingPost, setSubmittingPost] = useState(false);

  const cancelPost = () => {
    if (submittingPost) return;
    setCreatingPost(false);
  };

  useEffect(() => {
    setTimeout(() => setPostSuccess(false), 3000);
  }, [postSuccess]);

  useEffect(() => {
    setSelectedTopics([]);
  }, [creatingPost]);

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
          cancelPost: cancelPost,
        }}
      >
        <PostTypeDropDown setPostType={setPostType} postType={postType} />
        <PostTypeSpecificForm
          setCreatingPost={setCreatingPost}
          postType={postType}
          setPostType={setPostType}
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
          <p className="not-creating-post-text">Post to your followers</p>
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
    case OPEN_POSITION_POST:
      return (
        <OpenPositionPostForm
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
