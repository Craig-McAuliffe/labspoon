import React, {useState, useEffect} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import TopicListItem from './TopicListItem';
import {AttentionIcon, RemoveIcon} from '../../assets/GeneralActionIcons';
import SearchMSFields from './SearchMSFields';
import Popover, {StandardPopoverDisplay} from '../Popovers/Popover';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import '../Posts/Post/CreatePost/CreatePost.css';
import './TagTopics.css';
import {MAX_TOPICS_PER_POST} from '../Posts/Post/CreatePost/CreatePost';

const TAG_TOPICS_SEARCH_LIMIT = 10;
export default function TagTopics({
  submittingForm,
  selectedTopics,
  setSelectedTopics,
  largeDesign,
  superCachedSearchAndResults,
  setSuperCachedSearchAndResults,
  skippedTopics,
  setSkippedTopics,
}) {
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [cachedSearchAndResults, setCachedSearchAndResults] = useState({
    search: '',
    results: [],
    skip: 0,
    hasMore: false,
  });
  // Tells user that they are trying to input a duplicate topic
  useEffect(() => {
    if (duplicateTopic) {
      setTimeout(() => setDuplicateTopic(false), 3000);
    }
  }, [duplicateTopic]);

  useEffect(() => {
    if (submittingForm) {
      setDisplayedTopics([]);
      return;
    }
  }, [submittingForm]);

  if (largeDesign)
    return (
      <div>
        <SearchMSFields
          placeholder="Search topics"
          setFetchedTopics={setDisplayedTopics}
          fetchedTopics={displayedTopics}
          setLoading={setLoadingTopics}
          limit={TAG_TOPICS_SEARCH_LIMIT}
          largeDesign={true}
          cachedSearchAndResults={
            superCachedSearchAndResults
              ? superCachedSearchAndResults
              : cachedSearchAndResults
          }
          setCachedSearchAndResults={
            setSuperCachedSearchAndResults
              ? setSuperCachedSearchAndResults
              : setCachedSearchAndResults
          }
          loading={loadingTopics}
        >
          <SelectedTopics
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
          />
          <div className="create-post-skip-topics-button-container">
            {!skippedTopics && selectedTopics.length === 0 && (
              <button onClick={() => setSkippedTopics(true)}>Skip</button>
            )}
          </div>
          <TopicsList
            topics={displayedTopics}
            setSelectedTopics={setSelectedTopics}
            setDuplicateTopic={setDuplicateTopic}
            displayedTopics={displayedTopics}
            loadingTopics={loadingTopics}
            selectedTopics={selectedTopics}
          />
        </SearchMSFields>
      </div>
    );
  return (
    <div className="create-post-topic-section-container">
      <SelectedTopics
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
      />
      {duplicateTopic ? <DuplicateTopicWarning /> : null}
      {selectedTopics.length === 0 && (
        <div className="search-input-and-attention-symbol-container">
          <h3 className="create-post-topic-tag-title">Add related topics</h3>
          <Popover
            getPopUpComponent={() => (
              <StandardPopoverDisplay
                content={topicTaggingExplained}
                right="0px"
                top="20px"
              />
            )}
          >
            <TagTopicsAttention actionAndTriggerPopUp={() => {}} />
          </Popover>
        </div>
      )}
      <div className="create-post-topic-search-container">
        <SearchMSFields
          placeholder="search for topics..."
          setFetchedTopics={setDisplayedTopics}
          fetchedTopics={displayedTopics}
          setLoading={setLoadingTopics}
          loading={loadingTopics}
          limit={TAG_TOPICS_SEARCH_LIMIT}
          cachedSearchAndResults={
            superCachedSearchAndResults
              ? superCachedSearchAndResults
              : cachedSearchAndResults
          }
          setCachedSearchAndResults={
            setSuperCachedSearchAndResults
              ? setSuperCachedSearchAndResults
              : setCachedSearchAndResults
          }
        >
          <div>
            <TopicsList
              topics={displayedTopics}
              setSelectedTopics={setSelectedTopics}
              setDuplicateTopic={setDuplicateTopic}
              displayedTopics={displayedTopics}
              loadingTopics={loadingTopics}
              selectedTopics={selectedTopics}
            />
          </div>
        </SearchMSFields>
      </div>
    </div>
  );
}

const topicTaggingExplained =
  'Tagging topics improves the visibility of your post and is more convenient for your followers.';
function TagTopicsAttention({actionAndTriggerPopUp}) {
  return (
    <div className="tag-topics-attention-icon-button-container">
      <button
        type="button"
        className="tag-topics-attention-icon-button"
        onClick={actionAndTriggerPopUp}
        onMouseEnter={actionAndTriggerPopUp}
        onMouseLeave={(e) => actionAndTriggerPopUp(e, true)}
        style={{cursor: 'default'}}
      >
        <AttentionIcon />
      </button>
    </div>
  );
}

const TopicsList = ({
  topics,
  setSelectedTopics,
  setDuplicateTopic,
  displayedTopics,
  loadingTopics,
  selectedTopics,
}) => {
  const topicWarning =
    selectedTopics.length >= MAX_TOPICS_PER_POST ? (
      <p className="tag-topics-max-topic-warning">
        You cannot tag anymore topics (max 10).
      </p>
    ) : null;

  if (loadingTopics)
    return (
      <>
        {topicWarning}
        <div className="tag-topics-loading-topics-spinner-container">
          <LoadingSpinner />
        </div>
      </>
    );
  return (
    <>
      {topicWarning}
      {topics.map((displayedTopic) => (
        <TopicListItem
          key={displayedTopic.microsoftID}
          topic={displayedTopic}
          noLink
        >
          <PrimaryButton
            onClick={() =>
              addTopicToPost(
                setSelectedTopics,
                displayedTopic.name,
                setDuplicateTopic,
                displayedTopic.microsoftID,
                displayedTopic.normalisedName,
                displayedTopics,
                displayedTopic.id,
                selectedTopics
              )
            }
            smallVersion
          >
            Select
          </PrimaryButton>
        </TopicListItem>
      ))}
    </>
  );
};

function DuplicateTopicWarning() {
  return (
    <div className="topic-tag-duplicate-topic-warning">
      You have already added that topic
    </div>
  );
}

function SelectedTopics({selectedTopics, setSelectedTopics}) {
  return (
    <div className="create-post-tagged-topics-container">
      {selectedTopics.map((selectedTopic) => (
        <button
          type="button"
          key={selectedTopic.name}
          className="create-post-tagged-topic"
          onClick={() =>
            removeSelectedTopic(
              selectedTopic.name,
              selectedTopics,
              setSelectedTopics
            )
          }
        >
          <div>
            {selectedTopic.name}
            <RemoveIcon />
          </div>
        </button>
      ))}
    </div>
  );
}

// Checks if the user already added the topic
// Checks if the user is adding a topic name that already exists
const addTopicToPost = (
  setSelectedTopics,
  topicName,
  setDuplicateTopic,
  microsoftID,
  normalisedTopicName,
  displayedTopics,
  topicID,
  selectedTopics
) => {
  if (selectedTopics.length >= MAX_TOPICS_PER_POST) return;
  let preExistingTopic = undefined;
  if (microsoftID === undefined) {
    displayedTopics.forEach((displayedTopic) => {
      if (displayedTopic.name === topicName)
        preExistingTopic = [
          {
            name: displayedTopic.name,
            microsoftID: displayedTopic.microsoftID,
            normalisedName: displayedTopic.normalisedName,
            id: topicID,
          },
        ];
    });
  }
  setSelectedTopics((selectedTopics) => {
    const newSelectedTopic = {
      name: topicName,
      microsoftID: microsoftID,
      normalisedName: normalisedTopicName,
      id: topicID,
    };
    if (
      selectedTopics.some(
        (previouslySelectedTopic) =>
          previouslySelectedTopic.name === newSelectedTopic.name
      )
    ) {
      setDuplicateTopic(true);
      return selectedTopics;
    }
    let augmentedTopics;
    if (preExistingTopic !== undefined)
      augmentedTopics = [...selectedTopics, ...preExistingTopic];
    else {
      if (microsoftID === undefined) newSelectedTopic.isCustom = true;
      augmentedTopics = [...selectedTopics, newSelectedTopic];
    }
    return augmentedTopics;
  });
};

const removeSelectedTopic = (
  selectedTopicName,
  selectedTopics,
  setSelectedTopics
) => {
  const indexToBeRemoved = selectedTopics.findIndex(
    (previouslySelectedTopic) =>
      previouslySelectedTopic.name === selectedTopicName
  );
  setSelectedTopics((previouslySelectedTopics) => {
    const curatedSelectedTopics = [...previouslySelectedTopics];
    curatedSelectedTopics.splice(indexToBeRemoved, 1);
    if (curatedSelectedTopics.length === 0) return [];
    return curatedSelectedTopics;
  });
};

export function handlePostTopics(selectedTopics) {
  const customTopics = [];
  const DBTopics = [];
  selectedTopics.forEach((selectedTopic) => {
    if (selectedTopic.isCustom) {
      customTopics.push({name: selectedTopic.name});
    } else DBTopics.push(selectedTopic);
  });
  return {customTopics: customTopics, DBTopics: DBTopics};
}
