import React, {useContext, useState} from 'react';
import {AuthContext} from '../../App';
import {
  DropDownTriangle,
  InvertedDropDownTriangle,
} from '../../assets/GeneralActionIcons';
import {SignUpPopoverOverride} from '../Popovers/Popover';
import firebase from 'firebase';
import {db} from '../../firebase';

import './QualityScoreButton.css';

export default function QualityScoreButton({
  backgroundShade,
  postID,
  qualityScore,
  setQualityScore,
  loadingQualityScore,
  postAuthorID,
  votingLoadingError,
  downUpVoteState,
  setDownUpVoteState,
  loadingUserUpVoteState,
}) {
  const {user} = useContext(AuthContext);
  const [submittingQualityScore, setSubmittingQualityScore] = useState(false);
  const handleQualityScoreClick = async (downOrUp) => {
    if (
      (downOrUp !== 'down' && downOrUp !== 'up') ||
      !user ||
      votingLoadingError ||
      loadingQualityScore ||
      loadingUserUpVoteState
    )
      return;
    const userID = user.uid;
    if (userID === postAuthorID) return;
    if (submittingQualityScore) return;
    if (
      (downOrUp === 'up' && downUpVoteState === 'up') ||
      (downOrUp === 'down' && downUpVoteState === 'down')
    )
      return;
    setSubmittingQualityScore(true);
    const batch = db.batch();
    if (downOrUp === 'up') {
      batch.set(db.doc(`posts/${postID}/upVotedByUsers/${userID}`), {
        id: userID,
      });
      if (downUpVoteState === 'down') {
        batch.delete(db.doc(`posts/${postID}/downVotedByUsers/${userID}`));
        batch.delete(db.doc(`users/${userID}/downVotesPosts/${postID}`));
        // if user has downVoted, then an upVote will add upVote (+1) and remove downVote (+1)
        batch.update(db.doc(`posts/${postID}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(2)
            : 1,
        });
      } else
        batch.update(db.doc(`posts/${postID}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(1)
            : 1,
        });
      batch.set(db.doc(`users/${userID}/upVotesPosts/${postID}`), {
        id: postID,
      });
    }
    if (downOrUp === 'down') {
      batch.set(db.doc(`posts/${postID}/downVotedByUsers/${userID}`), {
        id: userID,
      });
      if (downUpVoteState === 'up') {
        batch.delete(db.doc(`posts/${postID}/upVotedByUsers/${userID}`));
        batch.delete(db.doc(`users/${userID}/upVotesPosts/${postID}`));
        // if user has upVoted, then a downVote will remove upVote (-1) and downVote (-1)
        batch.update(db.doc(`posts/${postID}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(-2)
            : -1,
        });
      } else
        batch.update(db.doc(`posts/${postID}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(-1)
            : -1,
        });
      batch.set(db.doc(`users/${userID}/downVotesPosts/${postID}`), {
        id: postID,
      });
    }
    await batch
      .commit()
      .catch((err) => console.error(`unable to commit quality score ${err}`));
    setQualityScore((currentScore) => {
      const additionOrSubtractionAmount = downUpVoteState ? 2 : 1;

      return downOrUp === 'up'
        ? currentScore + additionOrSubtractionAmount
        : currentScore - additionOrSubtractionAmount;
    });
    setDownUpVoteState(downOrUp);
    setSubmittingQualityScore(false);
  };

  return (
    <SignUpPopoverOverride text="Sign up to vote on this." active={!!user}>
      <PostQualityScore
        backgroundShade={backgroundShade}
        displayedQualityScore={qualityScore ? qualityScore : 0}
        downUpVoteState={downUpVoteState}
        handleQualityScoreClick={handleQualityScoreClick}
      />
    </SignUpPopoverOverride>
  );
}

function PostQualityScore({
  displayedQualityScore,
  downUpVoteState,
  handleQualityScoreClick,
  backgroundShade,
  actionAndTriggerPopUp,
}) {
  return (
    <div
      className={`post-quality-score-container-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      {displayedQualityScore}
      <div className="post-quality-score-symbol-container">
        <button
          className={`post-quality-score-button-${
            backgroundShade ? backgroundShade : 'light'
          }-${downUpVoteState === 'up' ? 'selected' : 'deselected'}`}
          onClick={() => {
            actionAndTriggerPopUp();
            handleQualityScoreClick('up');
          }}
        >
          <InvertedDropDownTriangle />
        </button>
        <button
          className={`post-quality-score-button-${
            backgroundShade ? backgroundShade : 'light'
          }-${downUpVoteState === 'down' ? 'selected' : 'deselected'}`}
          onClick={() => {
            actionAndTriggerPopUp();
            handleQualityScoreClick('down');
          }}
        >
          <DropDownTriangle />
        </button>
      </div>
    </div>
  );
}
