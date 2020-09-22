import React, {useState, useContext} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';

import './CreatePost.css';

const DEFAULT_POST = 'Default';

export default function CreatePost() {
  const user = useContext(AuthContext);
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
    default:
      return <DefaultPost />;
  }
}
