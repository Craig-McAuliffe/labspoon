import React, {useContext} from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import {CreatingPostContext} from './CreatePost';
import './CreatePost';

export default function CreatePostActions({formID}) {
  const {cancelPost} = useContext(CreatingPostContext);
  return (
    <div className="create-post-actions">
      <div className="create-post-cancel-container">
        {cancelPost ? <CancelButton cancelAction={cancelPost} /> : <></>}
      </div>
      <div className="create-post-actions-positive">
        <PrimaryButton submit={true} formID={formID}>
          Post
        </PrimaryButton>
      </div>
    </div>
  );
}
