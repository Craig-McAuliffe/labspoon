import React, {useState} from 'react';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

const BookmarkButton = ({currentState}) => {
  const [bookmarked, setBookmarked] = useState(currentState);
  return (
    <div className="button-container">
      {bookmarked ? <BookmarkIconSelected />:<BookmarkIconUnselected />}
      <button
        className="action-button"
        href="/"
        onClick={() => setBookmarked(!bookmarked)}
      >
        Bookmark
      </button>
    </div>
  );
};

export default BookmarkButton;
