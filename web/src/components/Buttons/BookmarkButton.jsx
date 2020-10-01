import React, {useState, useContext, useEffect} from 'react';
import {FeatureFlags, AuthContext} from '../../App';
import {db} from '../../firebase';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

import './Buttons.css';

function BookmarkButton({post}) {
  const [bookmarkID, setBookmarkID] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  const onClick = () => {
    if (!user) return;
    const bookmarkCollection = db.collection(`users/${user.uid}/bookmarks`);
    if (bookmarkID === undefined) {
      bookmarkCollection
        .add({
          resourceType: 'bookmark',
          bookmarkedResourceType: 'post',
          bookmarkedResourceID: post.id,
          bookmarkedResourceData: post,
        })
        .then((docRef) => {
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
  };

  // set the initial state of the bookmark
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    db.collection(`users/${user.uid}/bookmarks`)
      .where('bookmarkedResourceType', '==', 'post')
      .where('bookmarkedResourceID', '==', post.id)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          qs.forEach((bookmark) => {
            setBookmarkID(bookmark.id);
          });
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [featureFlags, post.id, user]);

  return (
    <div className="button-container">
      <button className="action-button" href="/" onClick={onClick}>
        {bookmarkID ? <BookmarkIconSelected /> : <BookmarkIconUnselected />}
        <span className="action-button-text">
          Bookmark {loading ? '(loading...)' : ''}
        </span>
      </button>
    </div>
  );
}

export default BookmarkButton;
