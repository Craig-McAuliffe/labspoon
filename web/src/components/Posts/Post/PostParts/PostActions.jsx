import React, {useContext, useEffect, useState} from 'react';

import {AuthContext, FeatureFlags} from '../../../../App';
import {db} from '../../../../firebase';

import BookmarkButton from '../../../Buttons/BookmarkButton';
import RecommendButton from '../../../Buttons/RecommendButton';
import RepostToGroupButton from '../../../Buttons/RepostToGroupButton';
import ShareButton from '../../../Buttons/ShareButton';
import './PostActions.css';

function BookmarkPostButton({post}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkID, setBookmarkID] = useState(undefined);
  // don't toggle when setting the current value
  const [firstRender, setFirstRender] = useState(true);
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  // set the initial state of the bookmark
  useEffect(() => {
    if (user && !featureFlags.has('disable-cloud-firestore')) {
      db.collection(`users/${user.uid}/bookmarks`)
        .where('bookmarkedResourceType', '==', 'post')
        .where('bookmarkedResourceID', '==', post.id)
        .get()
        .then((qs) => {
          if (!qs.empty) {
            qs.forEach((bookmark) => {
              setBookmarkID(bookmark.id);
            });
            setBookmarked(true);
          }
          setFirstRender(false);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  // update the status of the bookmark
  useEffect(() => {
    if (!featureFlags.has('disable-cloud-firestore')) {
      if (user && !firstRender) {
        const bookmarkCollection = db.collection(`users/${user.uid}/bookmarks`);
        if (bookmarked) {
          bookmarkCollection
            .add({
              resourceType: 'bookmark',
              bookmarkedResourceType: 'post',
              bookmarkedResourceID: post.id,
              bookmarkedResourceData: post,
            })
            .then((docRef) => {
              setBookmarked(true);
              setBookmarkID(docRef.id);
            })
            .catch((err) => console.log(err));
        } else {
          bookmarkCollection
            .doc(bookmarkID)
            .delete()
            .then(() => setBookmarkID(undefined))
            .catch((err) => console.log(err));
        }
      }
    }
  }, [bookmarked]);

  return (
    <BookmarkButton bookmarked={bookmarked} setBookmarked={setBookmarked} />
  );
}

const PostActions = ({post, dedicatedPage}) => {
  const featureFlags = useContext(FeatureFlags);
  return (
    <div
      className={dedicatedPage ? 'post-actions-dedicated-page' : 'post-actions'}
    >
      {featureFlags.has('repost-to-group') ? <RepostToGroupButton /> : <></>}
      {featureFlags.has('share-post') ? <ShareButton /> : <></>}
      {featureFlags.has('recommendations') ? <RecommendButton /> : <></>}
      {post ? (
        <BookmarkPostButton post={post} />
      ) : (
        <BookmarkButton bookmarked={false} setBookmarked={() => {}} />
      )}
    </div>
  );
};

export function BookmarkedPostSymbol({post}) {
  return (
    <div className="bookmark-page-post-bookmark">
      {post ? <BookmarkPostButton post={post} /> : null}
    </div>
  );
}

export default PostActions;
