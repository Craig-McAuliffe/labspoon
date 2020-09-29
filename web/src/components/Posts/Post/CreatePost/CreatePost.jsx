import React, {useState, useContext} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import OpenPositionPostForm from './OpenPositionPostForm';
import PublicationPostForm from './PublicationPostForm';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';

import './CreatePost.css';

const DEFAULT_POST = 'Default';
const PUBLICATION_POST = 'Publication';
const OPEN_POSITION_POST = 'Open Position';

export default function CreatePost({pinnedPost}) {
  const {user} = useContext(AuthContext);
  const [creatingPost, setCreatingPost] = useState(false);

  const cancelPost = () => {
    setCreatingPost(false);
  };

  if (!user) return null;
  return creatingPost ? (
    <PostTypeSpecificForm
      cancelPost={cancelPost}
      setCreatingPost={setCreatingPost}
    />
  ) : pinnedPost ? (
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
    </div>
  );
}

function PostTypeSpecificForm({cancelPost, setCreatingPost}) {
  const [postType, setPostType] = useState(DEFAULT_POST);
  switch (postType) {
    case DEFAULT_POST:
      return (
        <DefaultPost
          cancelPost={cancelPost}
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case PUBLICATION_POST:
      return (
        <PublicationPostForm
          cancelPost={cancelPost}
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case OPEN_POSITION_POST:
      return (
        <OpenPositionPostForm
          cancelPost={cancelPost}
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    default:
      return (
        <DefaultPost
          cancelPost={cancelPost}
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
  }
}
