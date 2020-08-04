import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';
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

import './Post.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Post({content}) {
  const postTypeIcons = () => {
    switch (content.type) {
      case 'default':
        return null;
        break;
      case 'publication':
        return <PublicationIcon />;
        break;
      case 'news':
        return <NewsIcon />;
        break;
      case 'open position':
        return <OpenPositionIcon />;
        break;
      case 'project':
        return <ProjectIcon />;
        break;
      case 'funding':
        return <FundingIcon />;
        break;
      case 'lecture':
        return <LectureIcon />;
        break;
      case 'member change':
        return <MemberChangeIcon />;
        break;
      default:
        return <div></div>;
    }
  };

  function postTextContent() {
    return (
      <div className="post-text-content">
        <h2>{content.title}</h2>
        <p>{content.text}</p>
      </div>
    );
  }

  function postTopics() {
    return (
      <Row className="post-topics">
        <p>
          <span className="topics-subTitle">Topics: </span>
          {content.topics.map((topic) => (
            <a key={topic.id} href="/" className="topic-names">
              {topic.name}{' '}
            </a>
          ))}
        </p>
      </Row>
    );
  }

  function postHeader() {
    return (
      <div className="post-header">
        <div className="post-header-profile">
          <Image
            className="post-header-avatar"
            src={content.author.avatar}
            roundedCircle
            width="60px"
          />
          <h2>{content.author.name}</h2>
        </div>

        <div className="post-type-container">
          <div className="post-type-icon">{postTypeIcons()}</div>
          <h2 className="post-type-name">{content.type}</h2>
        </div>
      </div>
    );
  }

  return (
    <Container fluid key={content.id} className="text-post">
      {postHeader()}
      {postTextContent()}
      <PostOptionalTags optionalTags={content.optionaltags} />
      {postTopics()}
      <PostActions />
    </Container>
  );
}
