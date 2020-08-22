import React from 'react';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

const BookmarkButton = ({bookmarked, setBookmarked}) => {
  const onClick = () => {
    setBookmarked(!bookmarked);
  };
  return (
    <div className="button-container">
      {bookmarked ? <BookmarkIconSelected /> : <BookmarkIconUnselected />}
      <button className="action-button" href="/" onClick={onClick}>
        Bookmark
      </button>
    </div>
  );
};

export default BookmarkButton;
