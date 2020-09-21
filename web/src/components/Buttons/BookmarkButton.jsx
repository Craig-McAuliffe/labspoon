import React from 'react';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

import './Buttons.css';

const BookmarkButton = ({bookmarked, setBookmarked}) => {
  const onClick = () => {
    setBookmarked(!bookmarked);
  };
  return (
    <div className="button-container">
      <button className="action-button" href="/" onClick={onClick}>
        {bookmarked ? <BookmarkIconSelected /> : <BookmarkIconUnselected />}
        <span className="action-button-text">Bookmark</span>
      </button>
    </div>
  );
};

export default BookmarkButton;
