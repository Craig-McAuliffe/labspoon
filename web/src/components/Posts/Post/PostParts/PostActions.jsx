import React, {useContext} from 'react';

import {FeatureFlags} from '../../../../App';

import BookmarkButton from '../../../Buttons/BookmarkButton';
import RecommendButton from '../../../Buttons/RecommendButton';
import RepostToGroupButton from '../../../Buttons/RepostToGroupButton';
import ShareButton from '../../../Buttons/ShareButton';
import './PostActions.css';

const PostActions = ({post, dedicatedPage}) => {
  const featureFlags = useContext(FeatureFlags);
  return (
    <div
      className={dedicatedPage ? 'post-actions-dedicated-page' : 'post-actions'}
    >
      {featureFlags.has('repost-to-group') ? <RepostToGroupButton /> : <></>}
      {featureFlags.has('share-post') ? <ShareButton /> : <></>}
      {featureFlags.has('recommendations') ? <RecommendButton /> : <></>}
      <BookmarkButton post={post} />
    </div>
  );
};

export function BookmarkedPostSymbol({post}) {
  return (
    <div className="bookmark-page-post-bookmark">
      {post ? <BookmarkButton post={post} /> : null}
    </div>
  );
}

export default PostActions;
