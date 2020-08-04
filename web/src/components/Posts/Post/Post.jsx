import React from 'react';
import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';

import './Post.css';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Generic entry point for display any type of post within a feed or search
 * result
 * @return {React.ReactElement}
*/
export default function Post({post}) {
  let contentBody;
  switch (post.type) {
    case 'text':
      contentBody = new PostTextContent(post);
      break;
    default:
      break;
  }
  return (
    <Container fluid key={post.id} className="text-post">
      {new PostHeader(post)}
      {contentBody}
      {new PostTopics(post)}
      <PostActions />
    </Container>
  );
}
Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
    content: PropTypes.object.isRequired,
    topics: PropTypes.arrayOf(PropTypes.exact({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })),
  }).isRequired,
};


/**
 * Display content for a post text
 * @return {React.ReactElement}
*/
function PostTextContent({title, content}) {
  return (
    <Row className="post-type-text">
      <h2>{title}</h2>
      <p>{content.text}</p>
    </Row>
  );
}
PostTextContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Display the actions that can be taken on any post
 * @return {React.ReactElement}
*/
function PostActions() {
  return (
    <Row className="post-actions">
      <p>
        <a href="/">Re-Post to Group</a>
        <a href="/">Share</a>
        <a href="/">Bookmark</a>
      </p>
    </Row>
  );
}

/** Display the topics with which a post has been tagged
 * @return {React.ReactElement}
*/
function PostTopics({topics}) {
  return (
    <Row className="post-topics">
      <p>
        Topics:{' '}
        {topics.map((topic) => (
          <a key={topic.id} href="/">
            {topic.name}{' '}
          </a>
        ))}
      </p>
    </Row>
  );
}
PostTopics.propTypes = {
  topics: PropTypes.arrayOf(PropTypes.exact({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
};

/**
 * Display the header on a post
 * @return {React.ReactElement}
*/
function PostHeader({type, author}) {
  return (
    <Row className="post-header">
      <div className="post-header-profile">
        <Image
          className="post-header-avatar"
          src={author.avatar}
          roundedCircle
          width="60px"
        />
        <h2>{author.name}</h2>
      </div>
      <div className="ml-auto post-header-type">
        <h2>{type.name}</h2>
      </div>
    </Row>
  );
}
PostHeader.propTypes = {
  type: PropTypes.string.isRequired,
  author: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
};
