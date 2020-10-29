import React, {useContext, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {SelectedListItemsContext} from '../../../pages/ResourcePages/GroupPage/EditGroupPosts';
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
import DefaultUserIcon from '../../../assets/DefaultUserIcon.svg';
import ListItemTopics from '../../CommonListItemParts/ListItemTopics';
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
  const selectionVariation = useContext(SelectedListItemsContext);
  const [isSelected, setIsSelected] = useState(false);

  // Checks if the post should already be selected
  useEffect(() => {
    if (post.hasBeenSelected) setIsSelected(true);
  }, [post.hasBeenSelected]);

  // Checks if the parent component resets all selections
  useEffect(() => {
    if (selectionVariation) {
      if (selectionVariation.resetSelection === true) setIsSelected(false);
    }
  }, [selectionVariation]);

  const referencedResourceWrapper = () => {
    if (dedicatedPage) return postContent();
    const referencedPublication = publications().filter(
      (publication) => publication.url === post.url
    )[0];
    if (referencedPublication)
      return (
        <div className="post-referenced-resource-container">
          <PublicationListItem
            publication={referencedPublication}
            removeBorder={true}
          />
          {postContent()}
        </div>
      );
    else if (post.hasSelector)
      return (
        <div className="post-with-selector-container">
          {postContent()}
          <div className="post-selector-container">
            {post.hasSelector === 'active-add' ||
            post.hasSelector === 'active-remove' ? (
              <>
                <button
                  className={
                    isSelected
                      ? 'post-selector-button-active'
                      : 'post-selector-button-inactive'
                  }
                  onClick={() =>
                    selectPost(
                      selectionVariation,
                      isSelected,
                      setIsSelected,
                      post
                    )
                  }
                />
                <p className="post-selector-active-text">
                  {post.hasSelector === 'active-add' ? 'Add' : 'Remove'}
                </p>
              </>
            ) : (
              <p className="post-selector-inactive-text">Already on group</p>
            )}
          </div>
        </div>
      );
    else return postContent();
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
      <ListItemTopics dbTopics={post.topics} customTopics={post.customTopics} />
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
    postType: PropTypes.object.isRequired,
    author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
    content: PropTypes.object.isRequired,
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

      <div className="post-type-container">
        <div className="post-type-icon">{postTypeIcons(postType.id)}</div>
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
      <p>{post.content.text}</p>
      {/* </Link> */}
    </div>
  );
}

function postTypeIcons(postTypeID) {
  switch (postTypeID) {
    case 'defaultPost':
      return null;
    case 'publicationPost':
      return <PublicationIcon />;
    case 'news':
      return <NewsIcon />;
    case 'openPositionPost':
      return <OpenPositionIcon />;
    case 'projectPost':
      return <ProjectIcon />;
    case 'fundingPost':
      return <FundingIcon />;
    case 'lecturePost':
      return <LectureIcon />;
    case 'memberChangePost':
      return <MemberChangeIcon />;
    default:
      return null;
  }
}

export function PinnedPost({post}) {
  if (post === undefined) return <></>;
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

const selectPost = (selectionVariation, isSelected, setIsSelected, post) => {
  if (selectionVariation) {
    const setFeedSelectionState = selectionVariation.setSelectedPosts;
    isSelected
      ? setFeedSelectionState((feedSelectionState) => {
          const filteredSelectionState = feedSelectionState.filter(
            (selectedPost) => selectedPost.id !== post.id
          );
          return filteredSelectionState;
        })
      : setFeedSelectionState((feedSelectionState) => [
          ...feedSelectionState,
          ...[post],
        ]);
    setIsSelected(!isSelected);
  }
};
