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
    console.log(selectionState);
    changeSelectionState((selectionState) => ({
      ...selectionState,
      [actionType]: switcheroo,
    }));
  };

  return (
    <Row className="post-actions">
      <div>
        <ToGroupIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('toGroup')}
        >
          Re-Post to Group
        </button>
      </div>
      <div>
        <ShareIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('share')}
        >
          Share
        </button>
      </div>
      <div>
        <BookmarkIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('bookmark')}
        >
          Bookmark
        </button>
      </div>
      <div>
        <RecommendIconSelector selectionState={selectionState} />
        <button
          className="action-button"
          href="/"
          onClick={() => actionTaken('recommend')}
        >
          Recommend
        </button>
      </div>
    </Row>
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
