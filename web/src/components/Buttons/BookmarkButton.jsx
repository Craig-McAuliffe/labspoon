import React, {useState, useContext, useEffect} from 'react';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

import './Buttons.css';
import {SignUpPopoverOverride} from '../Popovers/Popover';
import {BOOKMARK} from '../../helpers/resourceTypeDefinitions';
import NegativeButton from './NegativeButton';
import {LoadingSpinnerPage} from '../LoadingSpinner/LoadingSpinner';

function BookmarkButton({
  bookmarkedResource,
  bookmarkedResourceType,
  bookmarkedResourceID,
  bookmarkedByCollection,
}) {
  const [isBookmarked, setIsBookmarked] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {user, authLoaded} = useContext(AuthContext);

  const onClick = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (!user) {
      setSubmitting(false);
      return;
    }
    if (isBookmarked === undefined) {
      setSubmitting(false);
      return;
    }
    const userBookmarkCollection = db.collection(`users/${user.uid}/bookmarks`);
    if (isBookmarked === false) {
      const batch = db.batch();
      batch.set(userBookmarkCollection.doc(bookmarkedResourceID), {
        bookmarkedResourceType: bookmarkedResourceType,
        bookmarkedResourceID: bookmarkedResourceID,
        bookmarkedResourceData: bookmarkedResource,
        timestamp: new Date(),
      });
      batch.set(bookmarkedByCollection.doc(user.uid), {
        userID: user.uid,
      });
      batch
        .commit()
        .then(() => {
          setSubmitting(false);
          setIsBookmarked(true);
        })
        .catch((err) => {
          setSubmitting(false);
          console.log(err);
        });
    } else {
      await removeBookmark(
        userBookmarkCollection,
        bookmarkedResourceID,
        bookmarkedByCollection,
        user.uid,
        setSubmitting,
        setIsBookmarked
      );
    }
  };

  // set the initial state of the bookmark
  useEffect(() => {
    if (!user && authLoaded === false) return;
    if (!user && authLoaded === true) {
      setLoading(false);
      return;
    }
    if (loading === false) return;
    bookmarkedByCollection
      .doc(user.uid)
      .get()
      .then((bookmarkedByDS) => {
        if (bookmarkedByDS.exists) {
          setIsBookmarked(true);
        } else {
          setIsBookmarked(false);
        }
        setLoading(false);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkedResourceID, user]);

  if (!user)
    return (
      <SignUpPopoverOverride
        text="Sign up to follow this."
        actionTaken={BOOKMARK}
        active={!!user}
      >
        <BookmarkButtonContent
          onBookmark={onClick}
          isBookmarked={isBookmarked}
          loading={loading}
        />
      </SignUpPopoverOverride>
    );
  return (
    <BookmarkButtonContent
      onBookmark={onClick}
      isBookmarked={isBookmarked}
      loading={loading}
    />
  );
}

const BookmarkButtonContent = ({onBookmark, isBookmarked, loading}) => (
  <div className="button-container">
    <button className="action-button" href="/" onClick={onBookmark}>
      {isBookmarked ? <BookmarkIconSelected /> : <BookmarkIconUnselected />}
      <span className="action-button-text">
        Bookmark {loading ? '(loading...)' : ''}
      </span>
    </button>
  </div>
);

export async function removeBookmark(
  userBookmarkCollection,
  bookmarkedResourceID,
  bookmarkedByCollection,
  userID,
  setSubmitting,
  setIsBookmarked
) {
  const batch = db.batch();
  batch.delete(userBookmarkCollection.doc(bookmarkedResourceID));
  batch.delete(bookmarkedByCollection.doc(userID));
  return batch
    .commit()
    .then(() => {
      if (setIsBookmarked) setIsBookmarked(false);
      if (setSubmitting) setSubmitting(false);
    })
    .catch((err) => {
      console.log(err);
      if (setSubmitting) setSubmitting(false);
    });
}

export function RemoveBookmarkFromPage({postID, bookmarkedByCollection}) {
  const {user} = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const userBookmarkCollection = db.collection(`users/${user.uid}/bookmarks`);
  if (!user) return <LoadingSpinnerPage />;

  return (
    <div className="post-actions-actioned-page-container">
      <NegativeButton
        onClick={async () => {
          if (submitting) return;
          await removeBookmark(
            userBookmarkCollection,
            postID,
            bookmarkedByCollection,
            user.uid,
            setSubmitting
          );
          window.location.reload();
        }}
        small={true}
      >
        Remove Bookmark
      </NegativeButton>
    </div>
  );
}

export default BookmarkButton;
