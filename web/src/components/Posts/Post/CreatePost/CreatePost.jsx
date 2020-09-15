import React, {useState, useContext} from 'react';
import {AuthContext} from '../../../../App';
import PublicationPostForm from './PublicationPostForm';
import OpenPositionPostForm from './OpenPostitionPostForm';
import DefaultPost from './DefaultPost';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';

import './CreatePost.css';

export default function CreatePost() {
  const user = useContext(AuthContext);
  const [creatingPost, setCreatingPost] = useState(false);

  const cancelPost = () => {
    setCreatingPost(false);
  };

  if (!user) return null;
  return creatingPost ? (
    <div>
      <PostTypeSpecificForm
        cancelPost={cancelPost}
        setCreatingPost={setCreatingPost}
      />
    </div>
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
  const [postType, setPostType] = useState('Default');
  switch (postType) {
    case 'Default':
      return (
        <DefaultPost
          cancelPost={cancelPost}
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case 'Publication':
      return (
        <PublicationPostForm
          cancelPost={cancelPost}
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case 'Open Position':
      return (
        <OpenPositionPostForm
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
