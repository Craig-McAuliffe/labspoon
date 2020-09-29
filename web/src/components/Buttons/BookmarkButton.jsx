import React, {useState, useContext, useEffect} from 'react';
import {FeatureFlags, AuthContext} from '../../App';
import {db} from '../../firebase';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

import './Buttons.css';

function BookmarkButton({post}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkID, setBookmarkID] = useState(undefined);
  // don't toggle when setting the current value
  const [firstRender, setFirstRender] = useState(true);
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  const onClick = () => {
    setBookmarked(!bookmarked);
  };

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

  if (!post) {
    setBookmarked(false);
  }

  return (
    <div className="button-container">
      <button className="action-button" href="/" onClick={onClick}>
        {bookmarked ? <BookmarkIconSelected /> : <BookmarkIconUnselected />}
        <span className="action-button-text">Bookmark</span>
      </button>
    </div>
  );
}

export default BookmarkButton;
