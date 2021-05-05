import React, {useContext} from 'react';

import {AuthContext, FeatureFlags} from '../../../../App';
import {db} from '../../../../firebase';
import {POST} from '../../../../helpers/resourceTypeDefinitions';

import BookmarkButton, {
  RemoveBookmarkFromPage,
} from '../../../Buttons/BookmarkButton';
import GroupBookmarkButton from '../../../Buttons/GroupBookmarkButton';
import RecommendButton from '../../../Buttons/RecommendButton';
import RepostToGroupButton from '../../../Buttons/RepostToGroupButton';
import ShareButton from '../../../Buttons/ShareButton';
import './PostActions.css';

const PostActions = ({
  post,
  dedicatedPage,
  bookmarkedVariation,
  setQualityScore,
  qualityScore,
  backgroundShade,
}) => {
  const featureFlags = useContext(FeatureFlags);
  const bookmarkedByCollection = db.collection(`posts/${post.id}/bookmarkedBy`);
  const recommendedByCollection = db.collection(
    `posts/${post.id}/recommendedBy`
  );
  const {userProfile} = useContext(AuthContext);

  if (bookmarkedVariation)
    return (
      <RemoveBookmarkFromPage
        postID={post.id}
        bookmarkedByCollection={bookmarkedByCollection}
      />
    );
  return (
    <div
      className={
        dedicatedPage
          ? 'post-actions-dedicated-page'
          : `post-actions-${backgroundShade ? backgroundShade : 'light'}`
      }
    >
      {featureFlags.has('repost-to-group') ? <RepostToGroupButton /> : <></>}
      {featureFlags.has('share-post') ? <ShareButton /> : <></>}
      <RecommendButton
        recommendedResource={post}
        recommendedResourceType={POST}
        recommendedResourceID={post.id}
        recommendedByCollection={recommendedByCollection}
        backgroundShade={backgroundShade}
      />
      <BookmarkButton
        bookmarkedResource={post}
        bookmarkedResourceType={POST}
        bookmarkedResourceID={post.id}
        bookmarkedByCollection={bookmarkedByCollection}
        backgroundShade={backgroundShade}
      />
      {userProfile && userProfile.isMemberOfAnyGroups && (
        <GroupBookmarkButton
          bookmarkedResource={post}
          bookmarkedResourceType={POST}
          bookmarkedResourceID={post.id}
          bookmarkedByCollection={bookmarkedByCollection}
          backgroundShade={backgroundShade}
        />
      )}
    </div>
  );
};

export default PostActions;
