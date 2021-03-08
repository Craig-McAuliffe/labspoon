import React from 'react';
import {Link} from 'react-router-dom';
import PostTaggedContent from './PostParts/PostTaggedContent';
import PostActions from './PostParts/PostActions';
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import ListItemTopics from '../../ListItem/ListItemTopics';
import PublicationListItem from '../../Publication/PublicationListItem';
import UserAvatar from '../../Avatar/UserAvatar';

import 'bootstrap/dist/css/bootstrap.min.css';

import './Post.css';
import {
  OPENPOSITION,
  PUBLICATION,
} from '../../../helpers/resourceTypeDefinitions';
import {RichTextBody} from '../../Article/Article';

export default function Post({post, dedicatedPage, bookmarkedVariation}) {
  const taggedContent = [];
  if (post[PUBLICATION])
    taggedContent.push({type: PUBLICATION, content: post.publication});
  if (post[OPENPOSITION])
    taggedContent.push({type: OPENPOSITION, content: post.openPosition});

  if (post.generated)
    return (
      <div className="post-referenced-resource-container">
        <PublicationListItem
          publication={post.referencedResource}
          removeBorder={true}
        />
        <div className="post-container">
          <PostHeader
            postAuthor={post.author}
            postCreationDate={post.createdAt}
          />
          <PostTextContent post={post} />
        </div>
      </div>
    );

  return (
    <div
      className={
        dedicatedPage ? 'post-container-dedicated-page' : 'post-container'
      }
    >
      <PostHeader
        postAuthor={post.author}
        postCreationDate={post.createdAt}
        dedicatedPage={dedicatedPage}
      />
      <PostTextContent post={post} dedicatedPage={dedicatedPage} />
      <PostTaggedContent taggedContent={taggedContent} />
      <ListItemTopics dbTopics={post.topics} customTopics={post.customTopics} />
      <PostActions
        post={post}
        dedicatedPage={dedicatedPage}
        bookmarkedVariation={bookmarkedVariation}
      />
    </div>
  );
}

function PostHeader({postAuthor, postCreationDate, dedicatedPage}) {
  return (
    <div
      className={dedicatedPage ? 'post-header-dedicated-page' : 'post-header'}
    >
      <div className="post-header-profile">
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
          <p>{postCreationDate}</p>
        </div>
      </div>
      <div className="post-type-container"></div>
    </div>
  );
}

function PostTextContent({post, dedicatedPage}) {
  if (dedicatedPage)
    return (
      <div className="post-text-content">
        <RichTextBody body={post.text} shouldLinkify={true} />
      </div>
    );

  return (
    <div className="post-text-content">
      <Link to={`/post/${post.id}`} className="post-text-as-link">
        <RichTextBody body={post.text} shouldLinkify={true} />
      </Link>
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
