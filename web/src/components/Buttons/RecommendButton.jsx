import React, {useState} from 'react';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';

const RecommendButton = ({currentState}) => {
  const [recommending, setRecommending] = useState(currentState);
  return (
    <div className="button-container">
      <button
        className="action-button"
        href="/"
        onClick={() => setRecommending(!recommending)}
      >
        {recommending ? <RecommendIconSelected /> : <RecommendIconUnselected />}
        <span className="action-button-text">Recommend</span>
      </button>
    </div>
  );
};

export default RecommendButton;
