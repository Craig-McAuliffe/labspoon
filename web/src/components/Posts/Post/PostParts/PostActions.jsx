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
  const user = useContext(AuthContext);

  // set the initial state of the bookmark
  useEffect(() => {
    if (featureFlags.has('cloud-firestore')) {
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
    if (featureFlags.has('cloud-firestore')) {
      if (!firstRender) {
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

const PostActions = ({post}) => {
  return (
    <div className="post-actions">
      <RepostToGroupButton />
      <ShareButton />
      <RecommendButton />
      {post ? (
        <BookmarkPostButton post={post} />
      ) : (
        <BookmarkButton bookmarked={false} setBookmarked={() => {}} />
      )}
    </div>
  );
};

export default PostActions;
