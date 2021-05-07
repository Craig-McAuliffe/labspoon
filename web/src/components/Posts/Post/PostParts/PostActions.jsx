import React, {useContext, useState} from 'react';
import {AuthContext, FeatureFlags} from '../../../../App';
import {db} from '../../../../firebase';
import firebase from 'firebase';
import {POST} from '../../../../helpers/resourceTypeDefinitions';
import BookmarkButton, {
  RemoveBookmarkFromPage,
} from '../../../Buttons/BookmarkButton';
import CommentButton from '../../../Buttons/CommentButton';
import GroupBookmarkButton from '../../../Buttons/GroupBookmarkButton';
import RecommendButton from '../../../Buttons/RecommendButton';
import RepostToGroupButton from '../../../Buttons/RepostToGroupButton';
import ShareButton from '../../../Buttons/ShareButton';
import {initialValueNoTitle} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import ErrorMessage from '../../../Forms/ErrorMessage';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import {CreatingPostContext} from '../CreatePost/CreatePost';
import PostForm from '../CreatePost/PostForm';

import './PostActions.css';
import {userToUserRef} from '../../../../helpers/users';

export default function PostActions({
  post,
  dedicatedPage,
  bookmarkedVariation,
  backgroundShade,
  setIsShowingComments,
  setPostCommentCount,
  setResetCommentCache,
}) {
  const featureFlags = useContext(FeatureFlags);
  const [isCommenting, setIsCommenting] = useState(false);
  const bookmarkedByCollection = db.collection(`posts/${post.id}/bookmarkedBy`);
  const recommendedByCollection = db.collection(
    `posts/${post.id}/recommendedBy`
  );
  const {userProfile} = useContext(AuthContext);

  if (bookmarkedVariation)
    return (
      <RemoveBookmarkFromPage
        postID={post.id}
        bookmarkedByCollection={bookmarkedByCollection}
      />
    );
  return (
    <>
      <div
        className={
          dedicatedPage
            ? 'post-actions-dedicated-page'
            : `post-actions-${backgroundShade ? backgroundShade : 'light'}`
        }
      >
        {featureFlags.has('repost-to-group') ? <RepostToGroupButton /> : <></>}
        {featureFlags.has('share-post') ? <ShareButton /> : <></>}
        <RecommendButton
          recommendedResource={post}
          recommendedResourceType={POST}
          recommendedResourceID={post.id}
          recommendedByCollection={recommendedByCollection}
          backgroundShade={backgroundShade}
        />
        <BookmarkButton
          bookmarkedResource={post}
          bookmarkedResourceType={POST}
          bookmarkedResourceID={post.id}
          bookmarkedByCollection={bookmarkedByCollection}
          backgroundShade={backgroundShade}
        />
        {userProfile && userProfile.isMemberOfAnyGroups && (
          <GroupBookmarkButton
            bookmarkedResource={post}
            bookmarkedResourceType={POST}
            bookmarkedResourceID={post.id}
            backgroundShade={backgroundShade}
          />
        )}
        <CommentButton
          setIsCommenting={setIsCommenting}
          backgroundShade={backgroundShade}
        />
      </div>
      {isCommenting && (
        <div className="post-actions-create-comment-section">
          <CreateComment
            postID={post.id}
            backgroundShade={backgroundShade}
            setIsCommenting={setIsCommenting}
            postUnixTimeStamp={post.unixTimeStamp}
            setIsShowingComments={setIsShowingComments}
            setPostCommentCount={setPostCommentCount}
            setResetCommentCache={setResetCommentCache}
          />
        </div>
      )}
    </>
  );
}

const TOO_FAST = 'tooFast';
const DAILY_LIMIT = 'dailyLimit';
const DAILY_LIMIT_NUMBER = 60;
function CreateComment({
  postID,
  backgroundShade,
  setIsCommenting,
  postUnixTimeStamp,
  setIsShowingComments,
  setPostCommentCount,
  setResetCommentCache,
}) {
  const {userProfile} = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [spamCheckError, setSpamCheckError] = useState(null);
  const [submitError, setSubmitError] = useState(false);
  const submitComment = async (res) => {
    if (!userProfile) {
      setSubmitting(false);

      return;
    }
    const userID = userProfile.id;
    if (spamCheckError) setSpamCheckError(null);
    if (submitError) setSubmitError(false);
    const spamCheck = await authorIsSpammingCheck(userID);
    if (spamCheck) {
      setSpamCheckError(spamCheck);
      setSubmitting(false);
      return;
    }

    const authorActivityRef = db.doc(
      `activity/postActivity/creators/${userID}`
    );
    const userStatsRef = db.doc(`usersStats/${userID}`);

    const postCommentRef = db.collection(`posts/${postID}/comments`).doc();

    const userCommentsRef = db.doc(
      `users/${userID}/comments/${postCommentRef.id}`
    );
    const commentData = {
      postType: {id: 'postComment', name: 'Comment'},
      author: userToUserRef(userProfile, userProfile.id),
      text: res.title,
      timestamp: new Date(),
      unixTimeStamp: Math.floor(new Date().getTime() / 1000),
      id: postCommentRef.id,
    };
    const batch = db.batch();
    batch.set(
      authorActivityRef,
      {dailyPostCount: firebase.firestore.FieldValue.increment(1)},
      {merge: true}
    );
    batch.set(userStatsRef, {lastPostTimeStamp: postUnixTimeStamp});
    batch.set(postCommentRef, commentData);
    batch.set(userCommentsRef, {postID: postID, commentID: postCommentRef.id});
    batch.update(db.doc(`posts/${postID}`), {
      numberOfComments: firebase.firestore.FieldValue.increment(1),
    });
    const successOrFail = await batch
      .commit()
      .then(() => true)
      .catch((err) => {
        console.error(
          `unable to commit comment to post with id ${postID} ${err}`
        );
        setSubmitError(true);
        return false;
      });
    setSubmitting(false);
    if (!successOrFail) return;
    setIsCommenting(false);
    setIsShowingComments(true);
    setResetCommentCache(true);
    setPostCommentCount((count) => count + 1);
  };
  return (
    <div
      className={`create-comment-container-${
        backgroundShade ? backgroundShade : 'light'
      }${submitting ? '-submitting' : ''}`}
    >
      <CreatingPostContext.Provider
        value={{
          cancelPost: () => setIsCommenting(false),
          setSubmittingPost: setSubmitting,
          submittingPost: submitting,
        }}
      >
        {submitting && (
          <div className="create-comment-success-container">
            <LoadingSpinner />
          </div>
        )}
        {submitError && (
          <ErrorMessage noBorder={true}>
            Something went wrong. Please try again
          </ErrorMessage>
        )}
        {spamCheckError === TOO_FAST && (
          <ErrorMessage noBorder={true}>
            You are posting too fast. You need to wait at least 10 seconds
            between comments.
          </ErrorMessage>
        )}
        {spamCheckError === DAILY_LIMIT && (
          <ErrorMessage noBorder={true}>
            You have reached the maximum daily posting limit. This will be reset
            sometime in the next 24 hours. You will be able to post again after
            the reset.
          </ErrorMessage>
        )}
        <PostForm
          onSubmit={submitComment}
          initialValues={{title: initialValueNoTitle}}
          formID="create-post-comment"
          characterLimit="500"
          paragraphLimit="5"
          hasTweetOption={false}
        />
      </CreatingPostContext.Provider>
    </div>
  );
}

async function authorIsSpammingCheck(authorID) {
  const userStats = await db
    .doc(`usersStats/${authorID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return false;
      return ds.data();
    })
    .catch((err) =>
      console.error(
        `unable to check last post timestamp for user ${authorID} ${err}`
      )
    );

  if (userStats) {
    const lastPostTimeStamp = userStats.lastPostTimeStamp;
    if (lastPostTimeStamp) {
      const newUnixTimeStamp = Math.floor(new Date().getTime() / 1000);
      if (newUnixTimeStamp - lastPostTimeStamp < 10) {
        return TOO_FAST;
      }
    }
  }
  const activityData = await db
    .doc(`activity/postActivity/creators/${authorID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return;
      return ds.data();
    })
    .catch((err) =>
      console.error('unable to check new post for spam author', err)
    );
  if (!activityData) return false;
  if (activityData.dailyPostCount >= DAILY_LIMIT_NUMBER) return DAILY_LIMIT;
}
