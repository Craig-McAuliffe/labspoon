import React from 'react';
import {
  PUBLICATION_POST_NAME,
  DEFAULT_POST_NAME,
  OPEN_POSITION_POST_NAME,
  EVENT_POST_NAME,
  PROJECT_GRANT_POST_NAME,
  QUESTION_POST_NAME,
  IDEA_POST_NAME,
  SUB_TOPIC_POST_NAME,
  PostSectionSelectedTypeTopic,
  FUNDING_OPPORTUNITY,
} from './CreatePost';

import './CreatePost.css';

export default function TypeOfTaggedResourceDropDown({
  taggedResourceType,
  setTaggedResourceType,
}) {
  const resourceTypeOptions = [
    PUBLICATION_POST_NAME,
    OPEN_POSITION_POST_NAME,
    PROJECT_GRANT_POST_NAME,
    EVENT_POST_NAME,
    QUESTION_POST_NAME,
    IDEA_POST_NAME,
    SUB_TOPIC_POST_NAME,
    FUNDING_OPPORTUNITY,
    DEFAULT_POST_NAME,
  ];
  if (taggedResourceType)
    return (
      <PostSectionSelectedTypeTopic
        removeAction={() => setTaggedResourceType(null)}
        title={taggedResourceType}
      />
    );
  return (
    <div className="create-post-types-container">
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[0])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[0]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[1])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[1]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[2])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[2]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[3])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[3]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[4])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[4]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[5])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[5]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[6])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[6]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[7])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[7]}</h3>
      </button>
      <button
        onClick={() => setTaggedResourceType(resourceTypeOptions[8])}
        className="create-post-type-button"
      >
        <h3>{resourceTypeOptions[8]}</h3>
      </button>
    </div>
  );
}
