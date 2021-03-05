import React, {useState} from 'react';
import {db} from '../../firebase';
import {
  OPENPOSITIONS,
  PUBLICATIONS,
  resourceTypeToCollection,
  TOPIC,
} from '../../helpers/resourceTypeDefinitions';
import CancelButton from '../Buttons/CancelButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import SelectCheckBox, {setItemSelectedState} from '../Buttons/SelectCheckBox';
import PaginatedResourceFetch from '../PaginatedResourceFetch/PaginatedResourceFetch';

import './FollowOptionsPopover.css';
const INFINITE_SCROLL_TARGET_ID = 'scrollableFollowOptions';
export default function FollowOptionsPopover({
  targetResourceData,
  resourceType,
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedPostTypes, setSelectedPostTypes] = useState(['all']);
  const [submittingOptions, setSubmittingOptions] = useState(false);
  const saveFollowOptions = () => {
    setSubmittingOptions(true);
    setSubmittingOptions(false);
  };
  const optionsForm = (
    <>
      <h4 className="follow-options-title">I want to hear about...</h4>
      <ResourceFollowPostTypesOptions
        selectedPostTypes={selectedPostTypes}
        setSelectedPostTypes={setSelectedPostTypes}
      />
      <ResourceFollowTopicsOptions
        targetResourceData={targetResourceData}
        resourceCollectionName={resourceTypeToCollection(resourceType)}
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
        resourceType={resourceType}
      />
      <div className="follow-options-actions-container">
        {!submittingOptions && (
          <CancelButton cancelAction={() => setExpanded(false)}>
            Cancel
          </CancelButton>
        )}
        <PrimaryButton
          disabled={submittingOptions}
          onClick={saveFollowOptions}
          smallVersion={true}
        >
          Save
        </PrimaryButton>
      </div>
    </>
  );
  return (
    <div
      id={INFINITE_SCROLL_TARGET_ID}
      className={`follow-options-toggle-container${
        expanded ? '-expanded' : '-minimised'
      }`}
    >
      <button
        onClick={() => setExpanded(true)}
        className="follow-options-toggle"
      >
        Customise your follow
      </button>
      {expanded && optionsForm}
    </div>
  );
}

function ResourceFollowPostTypesOptions({
  selectedPostTypes,
  setSelectedPostTypes,
}) {
  const isPostTypeSelected = (postType) => selectedPostTypes.includes(postType);

  const postTypesOptions = [
    {id: 'all', text: 'All posts'},
    {id: 'general', text: 'General posts'},
    {id: PUBLICATIONS, text: 'Publication posts'},
    {id: OPENPOSITIONS, text: 'Open position posts'},
  ];
  const selectAll = () =>
    setSelectedPostTypes(() => postTypesOptions.map((postType) => postType.id));

  return (
    <div className="follow-options-post-types-container">
      {postTypesOptions.map((postType) => (
        <div className="follow-options-option-container" key={postType.id}>
          <div>{postType.text}</div>
          <SelectCheckBox
            selected={isPostTypeSelected(postType.id)}
            selectAction={() =>
              setItemSelectedState(
                postType.id,
                !isPostTypeSelected(postType.id),
                setSelectedPostTypes,
                'all',
                selectAll
              )
            }
            isSmallVersion={true}
          />
        </div>
      ))}
    </div>
  );
}

const LIMIT = 16;
function ResourceFollowTopicsOptions({
  targetResourceData,
  resourceCollectionName,
  setSelectedTopics,
  selectedTopics,
  resourceType,
}) {
  const targetResourceTopicsRef = db.collection(
    `${resourceCollectionName}/${targetResourceData.id}/topics`
  );
  const initialResults = [
    {
      name: 'All topics',
      resourceType: TOPIC,
    },
  ];
  return (
    <div className="follow-options-topics-container">
      <h4 className="follow-options-topics-note">I&#39;m interested in...</h4>
      <PaginatedResourceFetch
        isSelectable={true}
        collectionRef={targetResourceTopicsRef}
        setSelectedItems={setSelectedTopics}
        selectedItems={selectedTopics}
        limit={LIMIT}
        resourceType={TOPIC}
        isSmallVersion={true}
        customEndMessage={`No topics associated with this ${resourceType}`}
        initialResults={initialResults}
        useSmallListItems={true}
        useSmallCheckBox={true}
        noDivider={true}
        rankByName={true}
        scrollableTarget={INFINITE_SCROLL_TARGET_ID}
      />
    </div>
  );
}
