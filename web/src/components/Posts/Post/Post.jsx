import React, {useContext, useEffect, useState} from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import PostTaggedContent from './PostParts/PostTaggedContent';
import PostActions from './PostParts/PostActions';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import ListItemTopics from '../../ListItem/ListItemTopics';
import UserAvatar from '../../Avatar/UserAvatar';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  COMMENT,
  OPENPOSITION,
  POST,
  PUBLICATION,
} from '../../../helpers/resourceTypeDefinitions';
import {RichTextBody} from '../../Article/Article';
import {
  ListItemOptionsDropdown,
  PIN,
  NEWS,
} from '../../ListItem/ListItemCommonComponents';
import QualityScoreButton from '../../Buttons/QualityScoreButton';
import './Post.css';
import {PaginatedFetchAndResults} from '../../PaginatedResourceFetch/PaginatedResourceFetchAndResults';
import {db} from '../../../firebase';
import {AuthContext} from '../../../App';

export default function Post({post, dedicatedPage, bookmarkedVariation}) {
  const [isShowingComments, setIsShowingComments] = useState(false);
  const [postCommentCount, setPostCommentCount] = useState(
    post.numberOfComments ? post.numberOfComments : 0
  );
  const [downUpVoteState, setDownUpVoteState] = useState(null);
  const [votingLoadingError, setVotingLoadingError] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [resetCommentCache, setResetCommentCache] = useState(null);
  const pathname = useLocation().pathname;
  const {user} = useContext(AuthContext);
  const isOnSearchPage = pathname.includes('search');
  const [loadingQualityScore, setLoadingQualityScore] = useState(
    isOnSearchPage ? true : false
  );
  const [loadingUserUpVoteState, setLoadingUserUpVoteState] = useState(true);
  const [qualityScore, setQualityScore] = useState(
    post.qualityScore ? post.qualityScore : null
  );
  const postID = post.id;
  // we are not updating quality score or number of comments on algolia to save on costs
  useEffect(async () => {
    if (!isOnSearchPage) return;
    if (!user) return;
    await db
      .doc(`posts/${postID}`)
      .get()
      .then((postDS) => {
        if (!postDS.exists) {
          setLoadingError(true);
          return;
        }
        const mainPostData = postDS.data();
        if (mainPostData.numberOfComments)
          setPostCommentCount(mainPostData.numberOfComments);
        if (mainPostData.qualityScore)
          setQualityScore(mainPostData.qualityScore);
      })
      .catch((err) => {
        console.error(`unable to load post with id ${postID} ${err}`);
        setLoadingError(true);
      });

    setLoadingQualityScore(false);
  }, [user, pathname]);

  useEffect(async () => {
    if (!user) return;
    const hasUserUpVotedDS = await db
      .doc(`posts/${postID}/upVotedByUsers/${user.uid}`)
      .get()
      .catch((err) => {
        setVotingLoadingError(true);
        console.error(
          `unable to load upVote state for post with id ${postID} ${err}`
        );
      });

    if (!hasUserUpVotedDS) {
      setVotingLoadingError(true);
      setLoadingUserUpVoteState(false);
      return;
    }

    if (hasUserUpVotedDS && hasUserUpVotedDS.exists) {
      setDownUpVoteState('up');
      setLoadingUserUpVoteState(false);
      return;
    }

    const hasUserDownVotedDS = await db
      .doc(`posts/${postID}/downVotedByUsers/${user.uid}`)
      .get()
      .catch((err) =>
        console.error(
          `unable to load downVote state for post with id ${postID} ${err}`
        )
      );
    if (!hasUserDownVotedDS) {
      setVotingLoadingError(true);
      setLoadingUserUpVoteState(false);
      return;
    }
    if (hasUserDownVotedDS && hasUserDownVotedDS.exists) {
      setDownUpVoteState('down');
    }
    setLoadingUserUpVoteState(false);
  }, [user]);

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
      {loadingError ? (
        <h3>Something went wrong</h3>
      ) : (
        <>
          <div className={dedicatedPage ? '' : 'post-content-container'}>
            <PostHeader
              postAuthor={post.author}
              postUnixTimestamp={post.unixTimeStamp}
              dedicatedPage={dedicatedPage}
              post={post}
              backgroundShade={post.backgroundShade}
              qualityScore={qualityScore}
              setQualityScore={setQualityScore}
              loadingQualityScore={loadingQualityScore}
              votingLoadingError={votingLoadingError}
              downUpVoteState={downUpVoteState}
              setDownUpVoteState={setDownUpVoteState}
              loadingUserUpVoteState={loadingUserUpVoteState}
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
            setIsShowingComments={setIsShowingComments}
            setPostCommentCount={setPostCommentCount}
            setResetCommentCache={setResetCommentCache}
          />
        </>
      )}

      <PostCommentsSection
        backgroundShade={post.backgroundShade}
        isShowingComments={isShowingComments}
        postCommentCount={postCommentCount}
        setIsShowingComments={setIsShowingComments}
        postID={post.id}
        resetCommentCache={resetCommentCache}
        setResetCommentCache={setResetCommentCache}
      />
      {/* TO DO: Track number of comments on post doc. Only display if more than 0 */}
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
  qualityScore,
  setQualityScore,
  loadingQualityScore,
  votingLoadingError,
  downUpVoteState,
  setDownUpVoteState,
  loadingUserUpVoteState,
  resetCommentCache,
}) {
  return (
    <div
      className={
        dedicatedPage
          ? 'post-header-dedicated-page'
          : 'post-header-' + (backgroundShade ? backgroundShade : 'light')
      }
    >
      <PostAvatarSection
        backgroundShade={backgroundShade}
        avatar={postAuthor.avatar}
        name={postAuthor.name}
        postUnixTimestamp={postUnixTimestamp}
        authorID={postAuthor.id}
      />

      <div className="post-header-top-right-container">
        <QualityScoreButton
          postID={post.id}
          backgroundShade={backgroundShade}
          postAuthorID={post.author.id}
          qualityScore={qualityScore}
          setQualityScore={setQualityScore}
          loadingQualityScore={loadingQualityScore}
          votingLoadingError={votingLoadingError}
          downUpVoteState={downUpVoteState}
          setDownUpVoteState={setDownUpVoteState}
          loadingUserUpVoteState={loadingUserUpVoteState}
        />

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

function PostAvatarSection({
  backgroundShade,
  avatar,
  name,
  postUnixTimestamp,
  authorID,
}) {
  return (
    <div
      className={`post-header-profile-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      <div className="post-header-avatar">
        {avatar ? (
          <UserAvatar src={avatar} width="60px" height="60px" />
        ) : (
          <img src={DefaultUserIcon} alt="user icon" />
        )}
      </div>
      <div>
        <h3>
          <Link to={`/user/${authorID}`}>{name}</Link>
        </h3>
        <p>{calculateHoursAndDaysSincePost(postUnixTimestamp)}</p>
      </div>
    </div>
  );
}

function PostCommentsSection({
  backgroundShade,
  setIsShowingComments,
  isShowingComments,
  postCommentCount,
  postID,
  resetCommentCache,
  setResetCommentCache,
}) {
  const [cachedComments, setCachedComments] = useState({
    results: [],
    skip: 0,
    hasMore: false,
    last: null,
  });

  useEffect(() => {
    if (!resetCommentCache) return;
    setResetCommentCache(false);
  }, [resetCommentCache]);

  if (!postCommentCount > 0) return null;
  return (
    <div
      className={`post-comment-section-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      <div className="post-comment-toggle-container">
        <button
          onClick={() => setIsShowingComments((currentState) => !currentState)}
        >
          {isShowingComments ? 'Hide' : 'Show'} {postCommentCount} comments
        </button>
      </div>
      {isShowingComments && (
        <PaginatedFetchAndResults
          collectionRef={db.collection(`posts/${postID}/comments`)}
          limit={10}
          resourceType={COMMENT}
          superCachedResults={cachedComments}
          setSuperCachedResults={setCachedComments}
          backgroundShade={backgroundShade}
          resetResults={resetCommentCache}
        />
      )}
    </div>
  );
}

export function Comment({comment}) {
  if (!comment) return null;
  return (
    <div
      className={`comment-container-${
        comment.backgroundShade ? comment.backgroundShade : 'light'
      }`}
    >
      <PostAvatarSection
        name={comment.author.name}
        avatar={comment.author.avatar}
        postUnixTimestamp={comment.unixTimeStamp}
        backgroundShade={comment.backgroundShade}
      />
      <PostTextContent
        backgroundShade={comment.backgroundShade}
        post={comment}
      />
    </div>
  );
}
