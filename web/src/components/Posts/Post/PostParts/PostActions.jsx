import React, {useState} from 'react';
import Row from 'react-bootstrap/Row';

import './PostActions.css';
import {
  BookmarkIconUnselected,
  RecommendIconUnselected,
  ToGroupIconUnselected,
  ShareIconUnselected,
  BookmarkIconSelected,
  RecommendIconSelected,
  ToGroupIconSelected,
  ShareIconSelected,
} from '../../../../assets/PostActionIcons';

const PostActions = () => {
  const [selectionState, changeSelectionState] = useState({
    toGroup: false,
    share: false,
    bookmark: false,
    recommend: false,
  });

  const actionTaken = (actionType) => {
    const switcheroo = !selectionState[actionType];
    changeSelectionState((selectionState) => ({
      ...selectionState,
      [actionType]: switcheroo,
    }));
  };

  return (
    <div className="post-actions">
      <div className="button-container">
        <ToGroupIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('toGroup')}
        >
          Re-Post to Group
        </button>
      </div>
      <div className="button-container">
        <ShareIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('share')}
        >
          Share
        </button>
      </div>
      <div className="button-container">
        <BookmarkIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('bookmark')}
        >
          Bookmark
        </button>
      </div>
      <div className="button-container">
        <RecommendIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('recommend')}
        >
          Recommend
        </button>
      </div>
    </div>
  );
};

const ToGroupIconSelector = ({selectionState}) => {
  if (selectionState.toGroup) return <ToGroupIconSelected />;
  return <ToGroupIconUnselected />;
};
const ShareIconSelector = ({selectionState}) => {
  if (selectionState.share) return <ShareIconSelected />;
  return <ShareIconUnselected />;
};
const BookmarkIconSelector = ({selectionState}) => {
  if (selectionState.bookmark) return <BookmarkIconSelected />;
  return <BookmarkIconUnselected />;
};
const RecommendIconSelector = ({selectionState}) => {
  if (selectionState.recommend) return <RecommendIconSelected />;
  return <RecommendIconUnselected />;
};

export default PostActions;
