import React, {useState, useContext, useEffect, useRef} from 'react';
import {FeatureFlags, AuthContext} from '../../App';
import {Link, useLocation} from 'react-router-dom';
import {db} from '../../firebase';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

import './Buttons.css';

function BookmarkButton({post}) {
  const [bookmarkID, setBookmarkID] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [signUpPrompt, setSignUpPrompt] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const locationPathName = useLocation().pathname;
  const {user} = useContext(AuthContext);
  const signUpPromptRef = useRef();

  const onClick = () => {
    if (!user) {
      setSignUpPrompt(true);
      return;
    }
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

  // Handle click on or outside signup prompt
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (signUpPromptRef.current) {
        if (
          !signUpPromptRef.current.contains(e.target) &&
          signUpPrompt === true
        )
          setSignUpPrompt(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

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
      {signUpPrompt ? (
        <div className="sign-up-prompt-center" ref={signUpPromptRef}>
          <Link
            to={{
              pathname: '/signup',
              state: {returnLocation: locationPathName},
            }}
          >
            Sign up to bookmark this.
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default BookmarkButton;
