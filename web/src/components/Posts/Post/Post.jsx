import React from 'react';
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
      <div className="post-topics">
        <p className="topics-sub-title">Topics: </p>
        <div className="topic-names-container">
          {content.topics.map((topic) => (
            <a key={topic.id} href="/" className="topic-names">
              {topic.name}{' '}
            </a>
          ))}
        </div>
      </div>
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
    <div className="text-post">
      {postHeader()}
      {postTextContent()}
      <PostOptionalTags optionalTags={content.optionaltags} />
      {postTopics()}
      <PostActions />
    </div>
  );
}
