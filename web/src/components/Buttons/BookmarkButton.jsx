import React, {useState} from 'react';
import {
  BookmarkIconUnselected,
  BookmarkIconSelected,
} from '../../assets/PostActionIcons';

const BookmarkButton = ({currentState}) => {
  const [buttonState, changeButtonState] = useState(currentState);
  return buttonState ? (
    <div className="button-container">
      <BookmarkIconSelected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(false)}
      >
        Bookmark
      </button>
    </div>
  ) : (
    <div className="button-container">
      <BookmarkIconUnselected />
      <button
        className="action-button"
        href="/"
        onClick={() => changeButtonState(true)}
      >
        Bookmark
      </button>
    </div>
  );
};

export default BookmarkButton;
