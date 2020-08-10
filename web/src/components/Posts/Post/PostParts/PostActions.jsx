import React, {useState} from 'react';
import BookmarkButton from '../../../Buttons/BookmarkButton';
import RecommendButton from '../../../Buttons/RecommendButton';
import RepostToGroupButton from '../../../Buttons/RepostToGroupButton';
import ShareButton from '../../../Buttons/ShareButton';
import './PostActions.css';

const PostActions = () => {
  return (
    <div className="post-actions">
      <RepostToGroupButton />
      <ShareButton />
      <RecommendButton />
      <BookmarkButton />
    </div>
  );
};

export default PostActions;
