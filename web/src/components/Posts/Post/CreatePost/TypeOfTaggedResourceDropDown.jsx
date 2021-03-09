import React from 'react';
import {
  PublicationIcon,
  LinkPostToAResourceIcon,
  OpenPositionIcon,
} from '../../../../assets/ResourceTypeIcons';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {PUBLICATION_POST, DEFAULT_POST, OPEN_POSITION_POST} from './CreatePost';

import './CreatePost.css';

export default function TypeOfTaggedResourceDropDown({
  taggedResourceType,
  setTaggedResourceType,
}) {
  const resourceTypeOptions = [PUBLICATION_POST, OPEN_POSITION_POST];

  const matchResourceTypeToIcon = (resourceType) => {
    switch (resourceType) {
      case PUBLICATION_POST:
        return <PublicationIcon />;
      case OPEN_POSITION_POST:
        return <OpenPositionIcon />;
      default:
        return null;
    }
  };

  const suggestedResourceTags = () =>
    resourceTypeOptions.map((resourceType) => (
      <button
        className="create-post-post-resource-type-suggestion"
        onClick={() => setTaggedResourceType(resourceType)}
        key={resourceType}
        type="button"
      >
        <h4>{resourceType}</h4>
      </button>
    ));

  return (
    <div>
      {taggedResourceType === DEFAULT_POST ? (
        <div className="create-post-post-resource-type-dropdown-section">
          <div className="create-post-post-resource-suggested-tags-container">
            <div className="create-post-tag-a-container">
              <LinkPostToAResourceIcon />
              <h4 className="create-post-tag-a">Tag a...</h4>
            </div>
            {suggestedResourceTags()}
          </div>
        </div>
      ) : (
        <div className="create-post-post-resource-type-dropdown-section-active">
          <button
            className="create-post-post-tagged-resource-type-button"
            onClick={() => setTaggedResourceType(DEFAULT_POST)}
            type="button"
          >
            {matchResourceTypeToIcon(taggedResourceType)}
            <h4>{taggedResourceType}</h4>
            <div className="create-post-remove-tagged-resource-icon-container">
              <RemoveIcon />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
