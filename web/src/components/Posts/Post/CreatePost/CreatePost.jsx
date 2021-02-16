import React, {useState, useContext, createContext, useEffect} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import PublicationPostForm from './PublicationPostForm';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';
import {Redirect, useLocation} from 'react-router-dom';

import './CreatePost.css';
import OpenPositionPostForm from './OpenPositionPostForm';

export const DEFAULT_POST = 'Default';
export const PUBLICATION_POST = 'Publication';
export const OPEN_POSITION_POST = 'Open Position';

export const CreatingPostContext = createContext();

export default function CreatePost({
  pinnedPost,
  keepExpanded = false,
  redirect = undefined,
}) {
  const {user, userProfile} = useContext(AuthContext);
  const [creatingPost, setCreatingPost] = useState(keepExpanded);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [postSuccess, setPostSuccess] = useState(false);
  const [taggedResourceType, setTaggedResourceType] = useState(DEFAULT_POST);
  const [submittingPost, setSubmittingPost] = useState(false);

  const locationPathname = useLocation().pathname;
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
  if (userProfile && !userProfile.name) return <Redirect to="/userName" />;
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
        <div
          className={locationPathname === '/' ? 'create-post-margin-top' : ''}
        >
          <PostTypeSpecificForm
            setCreatingPost={setCreatingPostIfNotExpanded}
            postType={taggedResourceType}
            setPostType={setTaggedResourceType}
          />
        </div>
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
      <button
        onClick={() => setCreatingPost(true)}
        className="not-creating-post-button"
      >
        <WriteIcon />
        <p className="not-creating-post-text">Post to your followers...</p>
        {postSuccess ? (
          <h4 className="post-success-message">Post Created!</h4>
        ) : null}
      </button>
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
