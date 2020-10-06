import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import PostTypeDropDown from './PostTypeDropDown';
import './CreatePost';

export default function CreatePostActions({cancelPost, postType, setPostType}) {
  return (
    <div className="create-post-actions">
      <div className="create-post-cancel-container">
        <CancelButton cancelAction={cancelPost} />
      </div>
      <div className="create-post-actions-positive">
        <PostTypeDropDown setPostType={setPostType} postType={postType} />
        <PrimaryButton submit={true} formID="create-post-form">
          Post
        </PrimaryButton>
      </div>
    </div>
  );
}
