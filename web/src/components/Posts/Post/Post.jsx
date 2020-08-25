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
import PostActions from './PostParts/PostActions';
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
export default function Post({post}) {
  const referencedResource = () => {
    if (post.url)
      return publications().filter(
        (publication) => publication.url === post.url
      )[0];
  };

  const postContent = () => (
    <div className="post-container">
      <PostHeader
        postType={post.postType}
        postAuthor={post.author}
        postCreationDate={post.createdAt}
      />
      <PostTextContent post={post} />
      <PostOptionalTags optionalTags={post.optionaltags} />
      <FeedItemTopics taggedItem={post} />
      <PostActions post={post} />
    </div>
  );

  return post.generated ? (
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
  ) : post.url ? (
    <div className="post-referenced-resource-container">
      <PublicationListItem
        publication={referencedResource()}
        removeBorder={true}
      />
      {postContent()}
    </div>
  ) : (
    postContent()
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.object.isRequired,
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
      })
    ),
    optionaltags: PropTypes.arrayOf(PropTypes.object.isRequired),
  }).isRequired,
};

/**
 * Display the header on a post
 * @return {React.ReactElement}
 */
function PostHeader({postType, postAuthor, postCreationDate}) {
  const postTypeName = () => {
    if (postType.name === 'default') return null;
    return <h2 className="post-type-name">{postType.name}</h2>;
  };

  return (
    <div className="post-header">
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
PostHeader.propTypes = {
  type: PropTypes.string.isRequired,
  author: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Display content for a post text
 * @return {React.ReactElement}
 */
function PostTextContent({post}) {
  return (
    <div className="post-text-content">
      <h3>{post.title}</h3>
      <p>{post.content.text}</p>
    </div>
  );
}
PostTextContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};

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
