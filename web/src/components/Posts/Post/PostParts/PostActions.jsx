import React, {useContext} from 'react';

import {FeatureFlags} from '../../../../App';
import {db} from '../../../../firebase';
import {POST} from '../../../../helpers/resourceTypeDefinitions';

import BookmarkButton, {
  RemoveBookmarkFromPage,
} from '../../../Buttons/BookmarkButton';
import RecommendButton from '../../../Buttons/RecommendButton';
import RepostToGroupButton from '../../../Buttons/RepostToGroupButton';
import ShareButton from '../../../Buttons/ShareButton';
import './PostActions.css';

const PostActions = ({post, dedicatedPage, bookmarkedVariation}) => {
  const featureFlags = useContext(FeatureFlags);
  const bookmarkedByCollection = db.collection(`posts/${post.id}/bookmarkedBy`);

  if (bookmarkedVariation)
    return (
      <RemoveBookmarkFromPage
        postID={post.id}
        bookmarkedByCollection={bookmarkedByCollection}
      />
    );
  return (
    <div
      className={dedicatedPage ? 'post-actions-dedicated-page' : 'post-actions'}
    >
      {featureFlags.has('repost-to-group') ? <RepostToGroupButton /> : <></>}
      {featureFlags.has('share-post') ? <ShareButton /> : <></>}
      <RecommendButton
        bookmarkedResource={post}
        bookmarkedResourceType={POST}
        bookmarkedResourceID={post.id}
        bookmarkedByCollection={bookmarkedByCollection}
      />
      <BookmarkButton
        bookmarkedResource={post}
        bookmarkedResourceType={POST}
        bookmarkedResourceID={post.id}
        bookmarkedByCollection={bookmarkedByCollection}
      />
    </div>
  );
};

export default PostActions;
