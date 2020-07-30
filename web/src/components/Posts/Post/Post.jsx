import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';

import './Post.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Post({content}) {
  let contentBody;
  switch (content.type) {
    case 'text':
      contentBody = new PostTextContent(content);
    default:
  }
  return (
    <Container key={content.id} className='text-post'>
      {new PostHeader(content)}
      {contentBody}
      {new PostTopics(content)}
      <PostActions />
    </Container>
  );
}

function PostTextContent({title, content}) {
  return (
    <Row className='post-type-text'>
      <h2>{title}</h2>
      <p>{content.text}</p>
    </Row>
  );
}

function PostActions() {
  return (
    <Row className="post-actions">
      <p>
        <a href='/'>Re-Post to Group</a>
        <a href='/'>Share</a>
        <a href='/'>Bookmark</a>
      </p>
    </Row>
  );
}

function PostTopics({topics}) {
  return (
    <Row className="post-topics">
      <p>Topics: {
        topics.map((topic) => <a key={topic.id} href='/'>{topic.name} </a>)
      }</p>
    </Row>
  );
}

function PostHeader({type, author}) {
  return (
    <Row className='post-header'>
      <div className="post-header-profile">
        <Image
          className='post-header-avatar'
          src={author.avatar}
          roundedCircle
          width='60px'
        />
        <h2>{author.name}</h2>
      </div>
      <div className="ml-auto post-header-type">
        <h2>{type}</h2>
      </div>
    </Row>
  );
}
