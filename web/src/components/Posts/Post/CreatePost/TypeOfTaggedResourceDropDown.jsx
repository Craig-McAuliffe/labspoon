import React, {useRef, useEffect, useState} from 'react';
import {
  PublicationIcon,
  OpenPositionIcon,
  LinkPostToAResourceIcon,
} from '../../../../assets/PostTypeIcons';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {DropDownTriangle} from '../../../../assets/GeneralActionIcons';
import {PUBLICATION_POST, OPEN_POSITION_POST, DEFAULT_POST} from './CreatePost';

import './CreatePost.css';

export default function TypeOfTaggedResourceDropDown({
  taggedResourceType,
  setTaggedResourceType,
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (dropdownRef.current) {
        if (!dropdownRef.current.contains(e.target) && openDropdown === true)
          setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

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
      >
        <h4>{resourceType}</h4>
      </button>
    ));

  const resourceTypeOptions = [PUBLICATION_POST, OPEN_POSITION_POST];
  return (
    <div
      className={
        taggedResourceType === DEFAULT_POST
          ? 'create-post-post-resource-type-dropdown-section'
          : 'create-post-post-resource-type-dropdown-section-active'
      }
    >
      {taggedResourceType === DEFAULT_POST ? (
        <>
          {' '}
          <div className="create-post-post-resource-type-dropdown-tag">
            <LinkPostToAResourceIcon /> <span>Tag a...</span>
          </div>
          <div className="create-post-post-resource-suggested-tags-container">
            {suggestedResourceTags()}
          </div>
        </>
      ) : (
        <button
          className="create-post-post-tagged-resource-type-button"
          onClick={() => setTaggedResourceType(DEFAULT_POST)}
        >
          {matchResourceTypeToIcon(taggedResourceType)}
          <h4>{taggedResourceType}</h4>
          <div className="create-post-remove-tagged-resource-icon-container">
            <RemoveIcon />
          </div>
        </button>
      )}
      <div className="create-post-resource-type-dropdown-container">
        <div className="create-post-post-resource-dropdown-toggle-container">
          <button
            className="create-post-post-resource-dropdown-toggle"
            onClick={() => setOpenDropdown((openState) => !openState)}
            type="button"
          >
            Other options
          </button>
          <button
            onClick={() => setOpenDropdown((openState) => !openState)}
            type="button"
          >
            <DropDownTriangle />
          </button>
        </div>
        {openDropdown ? (
          <div className="create-post-resource-type-dropdown" ref={dropdownRef}>
            {resourceTypeOptions.map((resourceType) => (
              <button
                onClick={() => setTaggedResourceType(resourceType)}
                className="create-post-resource-type-dropdown-option-button"
                type="button"
                key={resourceType}
              >
                <div
                  key={resourceType}
                  className="create-post-resource-type-dropdown-option-svg-container"
                >
                  {matchResourceTypeToIcon(resourceType)}
                </div>
                <h4>{resourceType}</h4>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
