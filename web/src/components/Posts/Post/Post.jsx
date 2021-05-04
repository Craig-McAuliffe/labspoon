import React, {useEffect, useState} from 'react';
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

import './Post.css';

export default function Post({post, dedicatedPage, bookmarkedVariation}) {
  const [qualityScore, setQualityScore] = useState(null);
  useEffect(async () => {
    if (post.qualityScore) return setQualityScore(post.qualityScore);
    const fetchedQualityScore = await db
      .doc(`posts/${post.id}`)
      .get()
      .then((ds) => ds.data().qualityScore)
      .catch((err) =>
        console.error(
          `unable to fetch quality score for post ${post.id} ${err}`
        )
      );
    if (!fetchedQualityScore) return;
    setRecommendedCount(fetchedQualityScore);
  }, [post.id]);

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
      <PostActions
        backgroundShade={post.backgroundShade}
        post={post}
        dedicatedPage={dedicatedPage}
        bookmarkedVariation={bookmarkedVariation}
        qualityScore={qualityScore}
        setQualityScore={setQualityScore}
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
}) {
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
