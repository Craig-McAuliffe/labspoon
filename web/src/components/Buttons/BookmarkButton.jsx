import React, {useState, useContext, useEffect} from 'react';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import firebase from 'firebase';
import {BookmarkIconUnselected} from '../../assets/PostActionIcons';
import {SignUpPopoverOverride} from '../Popovers/Popover';
import {
  BOOKMARK,
  POST,
  resourceTypeToCollection,
} from '../../helpers/resourceTypeDefinitions';
import {getPostListItemFromPost} from '../../helpers/posts';
import './Buttons.css';
import {useLocation} from 'react-router';
import {FilterableResultsContext} from '../FilterableResults/FilterableResults';

function BookmarkButton({
  bookmarkedResource,
  bookmarkedResourceType,
  bookmarkedResourceID,
  bookmarkedByCollection,
  backgroundShade,
}) {
  const [isBookmarked, setIsBookmarked] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {user, authLoaded} = useContext(AuthContext);
  const pathname = useLocation().pathname;
  const {setChildrenRefreshFeedToggle} = useContext(FilterableResultsContext);
  bookmarkedResource.bookmarkTimestamp = new Date();
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
    const bookmarkedResourceDoc = db.doc(
      `${resourceTypeToCollection(
        bookmarkedResourceType
      )}/${bookmarkedResourceID}`
    );
    if (isBookmarked === false) {
      const batch = db.batch();

      let resourceData;
      switch (bookmarkedResourceType) {
        case POST:
          resourceData = getPostListItemFromPost(bookmarkedResource);
        default:
          resourceData = getPostListItemFromPost(bookmarkedResource);
      }

      batch.set(userBookmarkCollection.doc(bookmarkedResourceID), {
        bookmarkedResourceType: bookmarkedResourceType,
        bookmarkedResourceID: bookmarkedResourceID,
        bookmarkedResourceData: resourceData,
        timestamp: new Date(),
      });
      batch.set(bookmarkedByCollection.doc(user.uid), {
        userID: user.uid,
      });
      batch.update(bookmarkedResourceDoc, {
        bookmarkedCount: firebase.firestore.FieldValue.increment(1),
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
        bookmarkedResourceDoc,
        user.uid,
        setSubmitting,
        setIsBookmarked
      );
      if (pathname.includes('bookmarks') && setChildrenRefreshFeedToggle)
        setChildrenRefreshFeedToggle();
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

  if (
    !bookmarkedResource ||
    !bookmarkedResourceType ||
    !bookmarkedResourceID ||
    !bookmarkedByCollection
  )
    return null;
  if (!user)
    return (
      <SignUpPopoverOverride
        text="Sign up to bookmark this."
        actionTaken={BOOKMARK}
        active={!!user}
        backgroundShade={backgroundShade}
      >
        <BookmarkButtonContent
          onBookmark={onClick}
          isBookmarked={isBookmarked}
          loading={loading}
          backgroundShade={backgroundShade}
        />
      </SignUpPopoverOverride>
    );
  return (
    <BookmarkButtonContent
      onBookmark={onClick}
      isBookmarked={isBookmarked}
      loading={loading}
      backgroundShade={backgroundShade}
    />
  );
}

const BookmarkButtonContent = ({
  onBookmark,
  isBookmarked,
  loading,
  backgroundShade,
}) => (
  <div className="post-actions-button-container">
    <button
      className={`action-button-${backgroundShade ? backgroundShade : 'light'}${
        isBookmarked ? '-selected' : '-unselected'
      }`}
      href="/"
      onClick={loading ? () => {} : onBookmark}
    >
      <BookmarkIconUnselected />
      <span className="action-button-text">Bookmark</span>
    </button>
  </div>
);

export async function removeBookmark(
  userBookmarkCollection,
  bookmarkedResourceID,
  bookmarkedByCollection,
  bookmarkedResourceDoc,
  userID,
  setSubmitting,
  setIsBookmarked
) {
  const batch = db.batch();
  batch.delete(userBookmarkCollection.doc(bookmarkedResourceID));
  batch.delete(bookmarkedByCollection.doc(userID));
  batch.update(bookmarkedResourceDoc, {
    bookmarkedCount: firebase.firestore.FieldValue.increment(-1),
  });
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

export default BookmarkButton;
