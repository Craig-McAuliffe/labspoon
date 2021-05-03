import React from 'react';
import {
  PUBLICATION_POST,
  DEFAULT_POST,
  OPEN_POSITION_POST,
  EVENT_POST,
  PROJECT_GRANT_POST,
  QUESTION_POST,
  IDEA_POST,
  MICRO_TOPIC_POST,
  PostSectionSelectedTypeTopic,
} from './CreatePost';

import './CreatePost.css';

export default function TypeOfTaggedResourceDropDown({
  taggedResourceType,
  setTaggedResourceType,
}) {
  const resourceTypeOptions = [
    PUBLICATION_POST,
    OPEN_POSITION_POST,
    PROJECT_GRANT_POST,
    EVENT_POST,
    QUESTION_POST,
    IDEA_POST,
    MICRO_TOPIC_POST,
    DEFAULT_POST,
  ];
  if (taggedResourceType)
    return (
      <PostSectionSelectedTypeTopic
        removeAction={() => setTaggedResourceType('')}
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
    </div>
  );
}
