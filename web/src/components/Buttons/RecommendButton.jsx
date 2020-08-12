import React, {useState} from 'react';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';

const RecommendButton = ({currentState}) => {
  const [recommending, setRecommending] = useState(currentState);
  return (
    <div className="button-container">
      {recommending ? <RecommendIconSelected /> : <RecommendIconUnselected />}
      <button
        className="action-button"
        href="/"
        onClick={() => setRecommending(!recommending)}
      >
        Recommend
      </button>
    </div>
  );
};

export default RecommendButton;
