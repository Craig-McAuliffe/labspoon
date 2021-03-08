import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {
  OPENPOSITIONS,
  PUBLICATIONS,
  resourceTypeToCollection,
  TOPIC,
} from '../../helpers/resourceTypeDefinitions';
import {convertTopicToTaggedTopic} from '../../helpers/topics';
import CancelButton from '../Buttons/CancelButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import SelectCheckBox, {setItemSelectedState} from '../Buttons/SelectCheckBox';
import {SimpleErrorText} from '../Forms/ErrorMessage';
import PaginatedResourceFetch from '../PaginatedResourceFetch/PaginatedResourceFetch';

import './FollowOptionsPopover.css';

const INFINITE_SCROLL_TARGET_ID = 'scrollableFollowOptions';
const postTypesOptions = [
  {id: 'all', name: 'All posts'},
  {id: 'general', name: 'General posts'},
  {id: PUBLICATIONS, name: 'Publication posts'},
  {id: OPENPOSITIONS, name: 'Open position posts'},
];

const initialTopicResults = [
  {
    name: 'All topics',
    id: 'allTopics',
    resourceType: TOPIC,
  },
  {
    name: 'Content without topics',
    id: 'noTopics',
    resourceType: TOPIC,
  },
];

export default function FollowOptionsPopover({
  targetResourceData,
  resourceType,
  noTopicOptions,
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedPostTypes, setSelectedPostTypes] = useState(['all']);
  const [isSubmittingOptions, setIsSubmittingOptions] = useState(false);
  const [noPostOptionsSelectedError, setNoPostOptionsSelectedError] = useState(
    false
  );
  const [topicResults, setTopicResults] = useState(initialTopicResults);
  const [success, setSuccess] = useState(false);
  const [submittingError, setSubmittingError] = useState(false);
  const {userProfile} = useContext(AuthContext);
  if (!userProfile) return null;
  const userID = userProfile.id;
  const saveFollowOptions = async () => {
    setIsSubmittingOptions(true);
    if (success) setSuccess(false);
    if (submittingError) setSubmittingError(false);
    if (noPostOptionsSelectedError) setNoPostOptionsSelectedError(false);
    const blockedTopics = [];
    const blockedPostTypes = [];
    const findUnselectedItems = (allOptions, selectedOptions) =>
      allOptions.filter(
        (option) =>
          !selectedOptions.some(
            (selectedOption) => selectedOption.id === option.id
          )
      );
    if (
      !selectedTopics.some(
        (selectedTopic) => selectedTopic.id === initialTopicResults[0].id
      )
    )
      findUnselectedItems(
        topicResults.filter(
          (topicResult) => topicResult.id !== topicResults[0].id
        ),
        selectedTopics
        // remove resourceType from topic
      ).forEach((unselectedItem) =>
        blockedTopics.push(
          convertTopicToTaggedTopic(unselectedItem, unselectedItem.id)
        )
      );
    if (
      !selectedPostTypes.some(
        (selectedPostType) => selectedPostType.id === postTypesOptions[0].id
      )
    )
      findUnselectedItems(
        postTypesOptions.filter(
          (postTypeOption) => postTypeOption.id !== postTypesOptions[0].id
        ),
        selectedPostTypes
      ).forEach((unselectedItem) => blockedPostTypes.push(unselectedItem));
    if (blockedPostTypes.length === 3) {
      setNoPostOptionsSelectedError(true);
      setIsSubmittingOptions(false);
      return;
    }
    if (noTopicOptions) blockedTopics.splice(0, blockedTopics.length);
    const capitaliseFirstLetter = (targetString) =>
      targetString[0].toUpperCase() + targetString.slice(1);
    const batch = db.batch();
    batch.update(
      db.doc(
        `${resourceTypeToCollection(resourceType)}/${
          targetResourceData.id
        }/followedByUsers/${userID}`
      ),
      {omittedTopics: blockedTopics, omittedPostTypes: blockedPostTypes}
    );
    batch.update(
      db.doc(
        `users/${userID}/follows${capitaliseFirstLetter(
          resourceTypeToCollection(resourceType)
        )}/${targetResourceData.id}`
      ),
      {omittedTopics: blockedTopics, omittedPostTypes: blockedPostTypes}
    );
    return batch
      .commit()
      .then(() => {
        setSuccess(true);
        setExpanded(false);
        setIsSubmittingOptions(false);
      })
      .catch((err) => {
        console.error(
          `unable to save follow preferences for user ${userID} ${err}`
        );
        setSubmittingError(true);
        setExpanded(false);
        setIsSubmittingOptions(false);
      });
  };
  const optionsForm = (
    <>
      <h4 className="follow-options-title">I want to hear about...</h4>
      <ResourceFollowPostTypesOptions
        selectedPostTypes={selectedPostTypes}
        setSelectedPostTypes={setSelectedPostTypes}
        noPostOptionsSelectedError={noPostOptionsSelectedError}
      />
      {!noTopicOptions && (
        <ResourceFollowTopicsOptions
          targetResourceData={targetResourceData}
          resourceCollectionName={resourceTypeToCollection(resourceType)}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          resourceType={resourceType}
          topicResults={topicResults}
          setTopicResults={setTopicResults}
        />
      )}
      <div className="follow-options-actions-container">
        {!isSubmittingOptions ? (
          <CancelButton cancelAction={() => setExpanded(false)}>
            Cancel
          </CancelButton>
        ) : (
          <div></div>
        )}
        <PrimaryButton
          disabled={isSubmittingOptions}
          onClick={saveFollowOptions}
          smallVersion={true}
        >
          Save
        </PrimaryButton>
      </div>
    </>
  );
  const minimisedOptionsText = () => {
    if (success && !expanded) return 'Preferences Saved.';
    if (submittingError && !expanded) return 'Something went wrong.';
    return 'Customise your follow';
  };
  return (
    <div
      className={`follow-options-toggle-container${
        expanded ? '-expanded' : '-minimised'
      }`}
    >
      <button
        onClick={() => setExpanded(true)}
        className="follow-options-toggle"
      >
        {minimisedOptionsText()}
      </button>
      {expanded && optionsForm}
    </div>
  );
}

function ResourceFollowPostTypesOptions({
  selectedPostTypes,
  setSelectedPostTypes,
  noPostOptionsSelectedError,
}) {
  const isPostTypeSelected = (postType) =>
    selectedPostTypes.some(
      (selectedPostType) => selectedPostType.id === postType.id
    );

  const selectAll = () =>
    setSelectedPostTypes(() => postTypesOptions.map((postType) => postType));

  useEffect(
    () =>
      setSelectedPostTypes(() => postTypesOptions.map((postType) => postType)),
    []
  );
  return (
    <div className="follow-options-post-types-container">
      {noPostOptionsSelectedError && (
        <SimpleErrorText>
          You must select at least one post type
        </SimpleErrorText>
      )}
      {postTypesOptions.map((postType) => (
        <div className="follow-options-option-container" key={postType.id}>
          <div>{postType.name}</div>
          <SelectCheckBox
            selected={isPostTypeSelected(postType)}
            selectAction={() =>
              setItemSelectedState(
                postType,
                !isPostTypeSelected(postType),
                setSelectedPostTypes,
                postTypesOptions[0],
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
  topicResults,
  setTopicResults,
}) {
  const targetResourceTopicsRef = db.collection(
    `${resourceCollectionName}/${targetResourceData.id}/topics`
  );

  return (
    <div
      className="follow-options-topics-container"
      id={INFINITE_SCROLL_TARGET_ID}
    >
      <h4 className="follow-options-topics-note">I&#39;m interested in...</h4>
      <PaginatedResourceFetch
        isSelectable={true}
        collectionRef={targetResourceTopicsRef}
        setSelectedItems={setSelectedTopics}
        selectedItems={selectedTopics}
        limit={LIMIT}
        resourceType={TOPIC}
        isSmallVersion={true}
        customEndMessage={`No more topics associated with this ${resourceType}`}
        useSmallListItems={true}
        useSmallCheckBox={true}
        noDivider={true}
        rankByName={true}
        scrollableTarget={INFINITE_SCROLL_TARGET_ID}
        selectAllOption={initialTopicResults[0]}
        results={topicResults}
        setResults={setTopicResults}
        selectedByDefault={true}
      />
    </div>
  );
}
