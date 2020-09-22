import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  LectureIcon,
  ProjectIcon,
  FundingIcon,
  OpenPositionIcon,
  NewsIcon,
  MemberChangeIcon,
  PublicationIcon,
} from '../../../assets/PostTypeIcons';
import PostOptionalTags from './PostParts/PostOptionalTags';
import PostActions, {BookmarkedPostSymbol} from './PostParts/PostActions';
import FeedItemTopics from '../../FeedItems/FeedItemTopics';
import PublicationListItem from '../../Publication/PublicationListItem';
import UserAvatar from '../../Avatar/UserAvatar';
import publications from '../../../mockdata/publications';

import 'bootstrap/dist/css/bootstrap.min.css';

import './Post.css';
/**
 * Generic entry point for display any type of post within a feed or search
 * result
 * @return {React.ReactElement}
 */
export default function Post({post, dedicatedPage, bookmarkedVariation}) {
  const referencedResourceWrapper = () => {
    if (dedicatedPage || post.url === undefined) return postContent();

    const referencedPublication = publications().filter(
      (publication) => publication.url === post.url
    )[0];
    return referencedPublication ? (
      <div className="post-referenced-resource-container">
        <PublicationListItem
          publication={referencedPublication}
          removeBorder={true}
        />
        {postContent()}
      </div>
    ) : (
      postContent()
    );
  };

  const postContent = () => (
    <div
      className={
        dedicatedPage ? 'post-container-dedicated-page' : 'post-container'
      }
    >
      {bookmarkedVariation ? <BookmarkedPostSymbol post={post} /> : null}
      <PostHeader
        postType={post.postType}
        postAuthor={post.author}
        postCreationDate={post.createdAt}
        dedicatedPage={dedicatedPage}
      />
      <PostTextContent post={post} />
      <PostOptionalTags optionalTags={post.optionaltags} />
      <FeedItemTopics taggedItem={post} />
      {bookmarkedVariation ? null : (
        <PostActions post={post} dedicatedPage={dedicatedPage} />
      )}
    </div>
  );

  if (post.generated)
    return (
      <div className="post-referenced-resource-container">
        <PublicationListItem
          publication={post.referencedResource}
          removeBorder={true}
        />
        <div className="post-container">
          <PostHeader
            postType={post.postType}
            postAuthor={post.author}
            postCreationDate={post.createdAt}
          />
          <PostTextContent post={post} />
        </div>
      </div>
    );
  return referencedResourceWrapper();
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    postType: PropTypes.object.isRequired,
    author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
    content: PropTypes.object.isRequired,
    topics: PropTypes.arrayOf(
      PropTypes.exact({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        resourceType: PropTypes.string.isRequired,
      })
    ),
    optionaltags: PropTypes.arrayOf(PropTypes.object.isRequired),
  }).isRequired,
};

/**
 * Display the header on a post
 * @return {React.ReactElement}
 */
function PostHeader({postType, postAuthor, postCreationDate, dedicatedPage}) {
  const postTypeName = () => {
    if (postType.name === 'default') return null;
    return <h2 className="post-type-name">{postType.name}</h2>;
  };

  return (
    <div
      className={dedicatedPage ? 'post-header-dedicated-page' : 'post-header'}
    >
      <div className="post-header-profile">
        <div className="post-header-avatar">
          <UserAvatar src={postAuthor.avatar} width="80px" height="80px" />
        </div>
        <div>
          <h2>
            <Link to={`/user/${postAuthor.id}`}>{postAuthor.name}</Link>
          </h2>
          <p>{postCreationDate}</p>
        </div>
      </div>

      <div className="post-type-container">
        <div className="post-type-icon">{postTypeIcons(postType.name)}</div>
        {postTypeName()}
      </div>
    </div>
  );
}

/**
 * Display content for a post text
 * @return {React.ReactElement}
 */
function PostTextContent({post}) {
  return (
    <div className="post-text-content">
      {/* <Link to={`/post/${post.id}`}> */}
      <h3>{post.title}</h3>
      {/* </Link> */}
      <p>{post.content.text}</p>
    </div>
  );
}

function postTypeIcons(postTypeName) {
  switch (postTypeName) {
    case 'default':
      return null;
    case 'publication':
      return <PublicationIcon />;
    case 'news':
      return <NewsIcon />;
    case 'open position':
      return <OpenPositionIcon />;
    case 'project':
      return <ProjectIcon />;
    case 'funding':
      return <FundingIcon />;
    case 'lecture':
      return <LectureIcon />;
    case 'member change':
      return <MemberChangeIcon />;
    default:
      return null;
  }
}

export function PinnedPost({post}) {
  return (
    <div className="pinned-post">
      <h3>{post.title}</h3>
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
