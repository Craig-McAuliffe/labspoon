import React, {useState} from 'react';
import {
  PublicationIcon,
  LinkPostToAResourceIcon,
} from '../../../../assets/PostTypeIcons';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {DropDownTriangle} from '../../../../assets/GeneralActionIcons';
import {PUBLICATION_POST, DEFAULT_POST} from './CreatePost';
import DropDown, {DropdownOption} from '../../../Dropdown';

import './CreatePost.css';

export default function TypeOfTaggedResourceDropDown({
  taggedResourceType,
  setTaggedResourceType,
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const resourceTypeOptions = [PUBLICATION_POST];

  const matchResourceTypeToIcon = (resourceType) => {
    switch (resourceType) {
      case PUBLICATION_POST:
        return <PublicationIcon />;
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

  const customTaggedResourceToggle = () => (
    <TaggedResourceDropdownToggle setOpenDropdown={setOpenDropdown} />
  );

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
      <DropDown
        customToggle={customTaggedResourceToggle}
        setOpenDropdown={setOpenDropdown}
        openDropdown={openDropdown}
      >
        <ResourceTypesDropDownOptions
          setOpenDropdown={setOpenDropdown}
          setTaggedResourceType={setTaggedResourceType}
          matchResourceTypeToIcon={matchResourceTypeToIcon}
          resourceTypeOptions={resourceTypeOptions}
        />
      </DropDown>
    </div>
  );
}

function TaggedResourceDropdownToggle({setOpenDropdown}) {
  return (
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
        className="create-post-resource-dropdown-toggle-triangle"
      >
        <DropDownTriangle />
      </button>
    </div>
  );
}

function ResourceTypesDropDownOptions({
  setOpenDropdown,
  setTaggedResourceType,
  matchResourceTypeToIcon,
  resourceTypeOptions,
}) {
  return resourceTypeOptions.map((resourceType) => (
    <DropdownOption
      key={resourceType}
      onSelect={() => setTaggedResourceType(resourceType)}
      height="70px"
    >
      <div className="create-post-resource-tag-dropdown-option">
        <div>{matchResourceTypeToIcon(resourceType)}</div>
        <h4 className="create-post-resource-tag-dropdown-option-name">
          {resourceType}
        </h4>
      </div>
    </DropdownOption>
  ));
}
