import React from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import './CreatePost';

export default function CreatePostActions({cancelPost}) {
  return (
    <div className="create-post-actions">
      <div className="create-post-cancel-container">
        <CancelButton cancelAction={cancelPost} />
      </div>
      <div className="create-post-actions-positive">
        <PrimaryButton submit={true} formID="create-post-form">
          Post
        </PrimaryButton>
      </div>
    </div>
  );
}
