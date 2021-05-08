import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {postTypeNameToNameAndID} from '../../helpers/posts';
import {
  resourceTypeToCollection,
  TOPIC,
} from '../../helpers/resourceTypeDefinitions';
import {convertTopicToTaggedTopic} from '../../helpers/topics';
import {TriggerFollowOptionsButton} from '../../pages/FollowsPage/FollowsPage';
import CancelButton from '../Buttons/CancelButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import SelectCheckBox, {setItemSelectedState} from '../Buttons/SelectCheckBox';
import {SimpleErrorText} from '../Forms/ErrorMessage';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {SelectablePaginatedResourceFetchAndResults} from '../PaginatedResourceFetch/PaginatedResourceFetchAndResults';
import {
  DEFAULT_POST_NAME,
  EVENT_POST_NAME,
  IDEA_POST_NAME,
  OPEN_POSITION_POST_NAME,
  PUBLICATION_POST_NAME,
  QUESTION_POST_NAME,
  SUB_TOPIC_POST_NAME,
  PROJECT_GRANT_POST_NAME,
} from '../Posts/Post/CreatePost/CreatePost';
import Popover from './Popover';

import './FollowOptionsPopover.css';

const INFINITE_SCROLL_TARGET_ID = 'scrollableFollowOptions';

const initialTopicResults = (backgroundShade) => [
  {
    name: 'All topics',
    id: 'allTopics',
    resourceType: TOPIC,
    backgroundShade: backgroundShade,
  },
  {
    name: 'Content without topics',
    id: 'noTopics',
    resourceType: TOPIC,
    backgroundShade: backgroundShade,
  },
];

export default function FollowOptionsPopover({
  targetResourceData,
  resourceType,
  noTopicOptions,
  isPreSelected,
  top,
  left,
  right,
  bottom,
  backgroundShade,
}) {
  const postTypesOptions = [
    {id: 'allOptions', name: 'All'},
    postTypeNameToNameAndID(DEFAULT_POST_NAME),
    postTypeNameToNameAndID(PUBLICATION_POST_NAME),
    postTypeNameToNameAndID(OPEN_POSITION_POST_NAME),
    postTypeNameToNameAndID(EVENT_POST_NAME),
    postTypeNameToNameAndID(QUESTION_POST_NAME),
    postTypeNameToNameAndID(IDEA_POST_NAME),
    postTypeNameToNameAndID(SUB_TOPIC_POST_NAME),
    postTypeNameToNameAndID(PROJECT_GRANT_POST_NAME),
  ];

  const [expanded, setExpanded] = useState(isPreSelected ? true : false);
  const [selectedTopics, setSelectedTopics] = useState([
    initialTopicResults(backgroundShade)[0].id,
  ]);
  const [selectedPostTypes, setSelectedPostTypes] = useState(postTypesOptions);
  const [isSubmittingOptions, setIsSubmittingOptions] = useState(false);
  const [noPostOptionsSelectedError, setNoPostOptionsSelectedError] = useState(
    false
  );
  const [topicResults, setTopicResults] = useState(
    initialTopicResults(backgroundShade)
  );
  const [success, setSuccess] = useState(false);
  const [submittingError, setSubmittingError] = useState(false);
  const [isNewlyPreselected, setIsNewlyPreselected] = useState(false);
  const {userProfile} = useContext(AuthContext);
  if (!userProfile) return null;

  const capitaliseFirstLetter = (targetString) =>
    targetString[0].toUpperCase() + targetString.slice(1);

  useEffect(async () => {
    if (!isPreSelected && !isNewlyPreselected) return;
    const existingFollowPreferences = await db
      .doc(
        `users/${userProfile.id}/follows${capitaliseFirstLetter(
          resourceTypeToCollection(resourceType)
        )}/${targetResourceData.id}`
      )
      .get()
      .catch((err) => console.error('unable to fetch follow preferences', err));

    if (!existingFollowPreferences) return;
    if (!existingFollowPreferences.exists) {
      console.error(
        `user ${userProfile.id} does not follow this ${resourceType} even though it is on their following page.`
      );
      return;
    }

    const existingUserFollowOptions = existingFollowPreferences.data();
    const existingOmittedPostTypes = existingUserFollowOptions.omittedPostTypes;
    if (existingOmittedPostTypes && existingOmittedPostTypes.length > 0)
      setSelectedPostTypes((currentSelectedPostTypes) =>
        currentSelectedPostTypes.filter((currentSelectedPostType) => {
          if (currentSelectedPostType.id === postTypesOptions[0].id)
            return false;
          return !existingOmittedPostTypes.some(
            (existingOmittedPostType) =>
              existingOmittedPostType.id === currentSelectedPostType.id
          );
        })
      );

    const existingOmittedTopics = existingUserFollowOptions.omittedTopics;
    if (existingOmittedTopics && existingOmittedTopics.length > 0) {
      setSelectedTopics((currentSelectedTopics) =>
        currentSelectedTopics.filter(
          (currentSelectedTopic) =>
            !existingOmittedTopics.some(
              (existingOmittedTopic) =>
                existingOmittedTopic.id === currentSelectedTopic.id
            )
        )
      );
    }
  }, [targetResourceData, expanded]);
  // saves preferences after submission in case user re-expands popover
  useEffect(() => {
    if (success && !isPreSelected) setIsNewlyPreselected(true);
  });

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
        (selectedTopic) =>
          selectedTopic.id === initialTopicResults(backgroundShade)[0].id
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
    if (blockedPostTypes.length >= postTypesOptions.length - 1) {
      setNoPostOptionsSelectedError(true);
      setIsSubmittingOptions(false);
      return;
    }
    if (noTopicOptions) blockedTopics.splice(0, blockedTopics.length);

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
      <h4
        className={`follow-options-title-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        I want to hear about...
      </h4>
      <ResourceFollowPostTypesOptions
        selectedPostTypes={selectedPostTypes}
        setSelectedPostTypes={setSelectedPostTypes}
        noPostOptionsSelectedError={noPostOptionsSelectedError}
        isSubmittingOptions={isSubmittingOptions}
        backgroundShade={backgroundShade}
        postTypesOptions={postTypesOptions}
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
          isSubmittingOptions={isSubmittingOptions}
          backgroundShade={backgroundShade}
        />
      )}
      <div
        className={`follow-options-actions-container-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        <CancelButton
          cancelAction={() => setExpanded(false)}
          isDisabled={isSubmittingOptions}
        >
          Cancel
        </CancelButton>
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
      }-${backgroundShade ? backgroundShade : 'light'}`}
      style={{top: top, left: left, right: right, bottom: bottom}}
    >
      <button
        onClick={() => setExpanded(true)}
        className={`follow-options-toggle-${
          backgroundShade ? backgroundShade : 'light'
        }`}
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
  isSubmittingOptions,
  backgroundShade,
  postTypesOptions,
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
  if (isSubmittingOptions)
    return (
      <div className="follow-options-popover-loading-spinner-container">
        <LoadingSpinner />
      </div>
    );
  return (
    <div className="follow-options-post-types-container">
      {noPostOptionsSelectedError && (
        <SimpleErrorText>
          You must select at least one post type
        </SimpleErrorText>
      )}
      {postTypesOptions.map((postType) => (
        <div
          className={`follow-options-option-container-${
            backgroundShade ? backgroundShade : 'light'
          }`}
          key={postType.id}
        >
          <div>{postType.id === 'defaultPost' ? 'Other' : postType.name}</div>
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
  isSubmittingOptions,
  backgroundShade,
}) {
  const targetResourceTopicsRef = db.collection(
    `${resourceCollectionName}/${targetResourceData.id}/topics`
  );

  if (isSubmittingOptions)
    return (
      <div className="follow-options-popover-loading-spinner-container">
        <LoadingSpinner />
      </div>
    );
  return (
    <div
      className="follow-options-topics-container"
      id={INFINITE_SCROLL_TARGET_ID}
    >
      <h4
        className={`follow-options-topics-note-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        I&#39;m interested in...
      </h4>
      <SelectablePaginatedResourceFetchAndResults
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
        selectAllOption={initialTopicResults(backgroundShade)[0]}
        results={topicResults}
        setResults={setTopicResults}
        selectedByDefault={true}
        backgroundShade={backgroundShade}
      />
    </div>
  );
}

export function FollowsPageListItemOptions({
  targetResourceData,
  resourceType,
  noTopicOptions = false,
}) {
  const getFollowOptionsPopover = () => (
    <FollowOptionsPopover
      targetResourceData={targetResourceData}
      resourceType={resourceType}
      isPreSelected={true}
      top="40px"
      left="-15vw"
      noTopicOptions={noTopicOptions}
    />
  );
  return (
    <Popover getPopUpComponent={getFollowOptionsPopover}>
      <TriggerFollowOptionsButton actionAndTriggerPopUp={() => {}} />
    </Popover>
  );
}
