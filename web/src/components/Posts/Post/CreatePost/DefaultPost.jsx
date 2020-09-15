import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import SubmitButton from '../../../Buttons/SubmitButton';
import PostTypeDropDown from './PostTypeDropDown';

import './CreatePost.css';

export default function DefaultPost({cancelPost, setPostType, postType}) {
  return (
    <div className="creating-post-container">
      <input type="text" className="create-post-main-text" />
      <div className="create-post-actions">
        <div className="create-post-cancel-container">
          <CancelButton cancelAction={cancelPost} />
        </div>
        <div className="create-post-actions-positive">
          <PostTypeDropDown setPostType={setPostType} postType={postType} />
          <SubmitButton inputText="Submit" />
        </div>
      </div>
    </div>
  );
}
