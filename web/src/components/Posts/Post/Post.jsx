import React, {useContext, useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import PostTaggedContent from './PostParts/PostTaggedContent';
import PostActions from './PostParts/PostActions';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import ListItemTopics from '../../ListItem/ListItemTopics';
import UserAvatar from '../../Avatar/UserAvatar';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  OPENPOSITION,
  POST,
  PUBLICATION,
} from '../../../helpers/resourceTypeDefinitions';
import {RichTextBody} from '../../Article/Article';
import {db} from '../../../firebase';
import {
  ListItemOptionsDropdown,
  PIN,
  NEWS,
} from '../../ListItem/ListItemCommonComponents';
import firebase from 'firebase';
import './Post.css';
import {
  DropDownTriangle,
  InvertedDropDownTriangle,
} from '../../../assets/GeneralActionIcons';
import {AuthContext} from '../../../App';
import {SignUpPopoverOverride} from '../../Popovers/Popover';

export default function Post({post, dedicatedPage, bookmarkedVariation}) {
  const taggedContent = [];
  if (post[PUBLICATION])
    taggedContent.push({type: PUBLICATION, content: post.publication});
  if (post[OPENPOSITION])
    taggedContent.push({type: OPENPOSITION, content: post.openPosition});

  return (
    <div
      className={
        dedicatedPage
          ? 'post-container-dedicated-page'
          : 'post-container-' +
            (post.backgroundShade ? post.backgroundShade : 'light')
      }
    >
      <div className={dedicatedPage ? '' : 'post-content-container'}>
        <PostHeader
          postAuthor={post.author}
          postUnixTimestamp={post.unixTimeStamp}
          dedicatedPage={dedicatedPage}
          post={post}
          backgroundShade={post.backgroundShade}
        />
        <PostTextContent
          backgroundShade={post.backgroundShade}
          post={post}
          dedicatedPage={dedicatedPage}
        />
        <PostTaggedContent
          backgroundShade={post.backgroundShade}
          taggedContent={taggedContent}
        />
        <ListItemTopics
          backgroundShade={post.backgroundShade}
          dbTopics={post.topics}
          customTopics={post.customTopics}
        />
      </div>
      <PostActions
        backgroundShade={post.backgroundShade}
        post={post}
        dedicatedPage={dedicatedPage}
        bookmarkedVariation={bookmarkedVariation}
      />
    </div>
  );
}

const calculateHoursAndDaysSincePost = (postUnixTimestamp) => {
  const secondsSincePost =
    Math.floor(new Date().getTime() / 1000) - postUnixTimestamp;
  if (secondsSincePost < 60)
    return `${secondsSincePost} second${secondsSincePost === 1 ? '' : 's'} ago`;
  const minutesSincePost = Math.floor(secondsSincePost / 60);
  if (minutesSincePost < 60)
    return `${minutesSincePost} minute${minutesSincePost === 1 ? '' : 's'} ago`;
  const hoursSincePost = Math.floor(minutesSincePost / 60);
  if (hoursSincePost < 24)
    return `${hoursSincePost} hour${hoursSincePost === 1 ? '' : 's'} ago`;
  const daysSincePost = Math.floor(hoursSincePost / 24);
  if (daysSincePost < 7)
    return `${daysSincePost} day${daysSincePost === 1 ? '' : 's'} ago`;
  const weeksSincePost = Math.floor(daysSincePost / 7);
  if (weeksSincePost < 4.5)
    return `${weeksSincePost} week${weeksSincePost === 1 ? '' : 's'} ago`;
  const monthsSincePost = Math.floor(daysSincePost / 30);
  if (monthsSincePost < 12)
    return `${monthsSincePost} month${monthsSincePost === 1 ? '' : 's'} ago`;
  const yearsSincePost = Math.floor(monthsSincePost / 12);
  return `${yearsSincePost} year${yearsSincePost === 1 ? '' : 's'} ago`;
};

function PostHeader({
  backgroundShade,
  postAuthor,
  postUnixTimestamp,
  dedicatedPage,
  post,
  userHasUpVoted,
  userHasDownVoted,
}) {
  const {user} = useContext(AuthContext);
  const [qualityScore, setQualityScore] = useState(null);
  const [downUpVoteState, setDownUpVoteState] = useState(() => {
    if (userHasUpVoted) return 'up';
    if (userHasDownVoted) return 'down';
    return null;
  });
  const [submittingQualityScore, setSubmittingQualityScore] = useState(false);
  const [loadingQualityScore, setLoadingQualityScore] = useState(true);
  const [votingLoadingError, setVotingLoadingError] = useState(false);

  const handleQualityScoreClick = async (downOrUp) => {
    if ((downOrUp !== 'down' && downOrUp !== 'up') || !user) return;
    const userID = user.uid;
    if (userID === post.author.id) return;
    if (submittingQualityScore) return;
    if (
      (downOrUp === 'up' && downUpVoteState === 'up') ||
      (downOrUp === 'down' && downUpVoteState === 'down')
    )
      return;
    setSubmittingQualityScore(true);
    const batch = db.batch();
    if (downOrUp === 'up') {
      batch.set(db.doc(`posts/${post.id}/upVotedByUsers/${userID}`), {
        id: userID,
      });
      if (downUpVoteState === 'down') {
        batch.delete(db.doc(`posts/${post.id}/downVotedByUsers/${userID}`));
        batch.delete(db.doc(`users/${userID}/downVotesPosts/${post.id}`));
        // if user has downVoted, then an upVote will add upVote (+1) and remove downVote (+1)
        batch.update(db.doc(`posts/${post.id}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(2)
            : 1,
        });
      } else
        batch.update(db.doc(`posts/${post.id}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(1)
            : 1,
        });
      batch.set(db.doc(`users/${userID}/upVotesPosts/${post.id}`), {
        id: post.id,
      });
    }
    if (downOrUp === 'down') {
      batch.set(db.doc(`posts/${post.id}/downVotedByUsers/${userID}`), {
        id: userID,
      });
      if (downUpVoteState === 'up') {
        batch.delete(db.doc(`posts/${post.id}/upVotedByUsers/${userID}`));
        batch.delete(db.doc(`users/${userID}/upVotesPosts/${post.id}`));
        // if user has upVoted, then a downVote will remove upVote (-1) and downVote (-1)
        batch.update(db.doc(`posts/${post.id}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(-2)
            : -1,
        });
      } else
        batch.update(db.doc(`posts/${post.id}`), {
          qualityScore: qualityScore
            ? firebase.firestore.FieldValue.increment(-1)
            : -1,
        });
      batch.set(db.doc(`users/${userID}/downVotesPosts/${post.id}`), {
        id: post.id,
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

  useEffect(async () => {
    if (!user) return;
    const checkUserUpVoteDownVote = async () => {
      const userHasUpVotedVotedDS = await db
        .doc(`posts/${post.id}/upVotedByUsers/${user.uid}`)
        .get()
        .catch((err) =>
          console.error(
            `unable to load upVote state for post with id ${post.id} ${err}`
          )
        );
      if (!userHasUpVotedVotedDS) {
        setVotingLoadingError(true);
        return;
      }
      if (userHasUpVotedVotedDS.exists) {
        return setDownUpVoteState('up');
      }
      const userHasDownVotedVotedDS = await db
        .doc(`posts/${post.id}/downVotedByUsers/${user.uid}`)
        .get()
        .catch((err) =>
          console.error(
            `unable to load downVote state for post with id ${post.id} ${err}`
          )
        );
      if (!userHasDownVotedVotedDS) {
        setVotingLoadingError(true);
        return;
      }
      if (userHasDownVotedVotedDS.exists) {
        setDownUpVoteState('down');
      }
    };
    await checkUserUpVoteDownVote();

    if (post.qualityScore) setQualityScore(post.qualityScore);
    else {
      const fetchedFullPost = await db
        .doc(`posts/${post.id}`)
        .get()
        .then((ds) => ds.data())
        .catch((err) =>
          console.error(
            `unable to fetch quality score for post ${post.id} ${err}`
          )
        );
      if (!fetchedFullPost) {
        setVotingLoadingError(true);
        setQualityScore(null);
      } else {
        const fetchedQualityScore = fetchedFullPost.qualityScore;
        setQualityScore(fetchedQualityScore ? fetchedQualityScore : null);
      }
    }
    setLoadingQualityScore(false);
  }, [user]);

  return (
    <div
      className={
        dedicatedPage
          ? 'post-header-dedicated-page'
          : 'post-header-' + (backgroundShade ? backgroundShade : 'light')
      }
    >
      <div
        className={`post-header-profile-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        <div className="post-header-avatar">
          {postAuthor.avatar ? (
            <UserAvatar src={postAuthor.avatar} width="60px" height="60px" />
          ) : (
            <img src={DefaultUserIcon} alt="user icon" />
          )}
        </div>
        <div>
          <h3>
            <Link to={`/user/${postAuthor.id}`}>{postAuthor.name}</Link>
          </h3>
          <p>{calculateHoursAndDaysSincePost(postUnixTimestamp)}</p>
        </div>
      </div>
      <div className="post-header-top-right-container">
        {!votingLoadingError && !loadingQualityScore && (
          <SignUpPopoverOverride
            text="Sign up to vote on this."
            active={!!user}
          >
            <PostQualityScore
              backgroundShade={backgroundShade}
              displayedQualityScore={qualityScore ? qualityScore : 0}
              downUpVoteState={downUpVoteState}
              handleQualityScoreClick={handleQualityScoreClick}
            />
          </SignUpPopoverOverride>
        )}

        {post.showPinOption && (
          <ListItemOptionsDropdown
            resourceType={POST}
            resourceID={post.id}
            item={post}
            pinProfileID={post.pinProfileID}
            pinProfileCollection={post.pinProfileCollection}
            options={[PIN, NEWS]}
            showNews={post.showNews}
            backgroundShade={post.backgroundShade}
            newsCollection={post.newsCollection}
          />
        )}
      </div>
    </div>
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
function PostTextContent({backgroundShade, post, dedicatedPage}) {
  const history = useHistory();
  if (dedicatedPage)
    return (
      <div className="post-text-content">
        <RichTextBody
          backgroundShade={backgroundShade}
          body={post.text}
          shouldLinkify={true}
        />
      </div>
    );

  const goToPost = () => history.push(`/post/${post.id}`);
  return (
    <div className="post-text-content">
      <div className="post-text-as-link" onMouseDown={goToPost}>
        <RichTextBody
          backgroundShade={backgroundShade}
          body={post.text}
          shouldLinkify={true}
        />
      </div>
    </div>
  );
}

export function PinnedPost({post}) {
  if (post === undefined) return <></>;
  return (
    <div className="pinned-post">
      <h3>
        <RichTextBody body={post.text} shouldLinkify={true} />
      </h3>
      <div>
        {post.topics
          .map((postTopic) => (
            <h4 key={postTopic.id} className="pinned-post-topic">
              {postTopic.name}
            </h4>
          ))
          .slice(0, 3)}
      </div>
      <p className="pinned-post-more-info">Click for more info</p>
    </div>
  );
}
