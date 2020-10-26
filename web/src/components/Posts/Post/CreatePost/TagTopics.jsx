import React, {useState, useRef, useEffect, useContext} from 'react';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import TopicListItem from '../../../Topics/TopicListItem';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {CreatingPostContext} from './CreatePost';
import './CreatePost';

export default function TagTopics() {
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const topicSearchRef = useRef();
  const {selectedTopics, setSelectedTopics} = useContext(CreatingPostContext);

  // Tells user that they are trying to input a duplicate topic
  useEffect(() => {
    if (duplicateTopic) {
      setTimeout(() => setDuplicateTopic(false), 3000);
    }
  }, [duplicateTopic]);
  return (
    <div className="create-post-topic-section-container">
      <SelectedTopics
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
      />
      {duplicateTopic ? <DuplicateTopicWarning /> : null}
      <div className="create-post-topic-search-container">
        <h4 className="create-post-topic-tag-title">Add related topics</h4>
        <div className="create-post-topic-search-tool-container">
          <FormDatabaseSearch
            setDisplayedItems={setDisplayedTopics}
            indexName="_TOPICS"
            inputRef={topicSearchRef}
            placeholderText="this post is about..."
            displayedItems={displayedTopics}
            hideSearchIcon
            clearListOnNoResults
          />
          <div className="create-post-searched-topics-container">
            <TypedTopic
              topicSearchRef={topicSearchRef}
              setSelectedTopics={setSelectedTopics}
              setDuplicateTopic={setDuplicateTopic}
              displayedTopics={displayedTopics}
            />
            <TopicsList
              topics={displayedTopics}
              setSelectedTopics={setSelectedTopics}
              setDuplicateTopic={setDuplicateTopic}
              displayedTopics={displayedTopics}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TopicsList = ({
  topics,
  setSelectedTopics,
  setDuplicateTopic,
  displayedTopics,
}) =>
  topics.map((displayedTopic) => (
    <TopicListItem key={displayedTopic.id} topic={displayedTopic}>
      <PrimaryButton
        onClick={() =>
          addTopicToPost(
            setSelectedTopics,
            displayedTopic.name,
            setDuplicateTopic,
            displayedTopic.id,
            displayedTopics
          )
        }
        small
      >
        Select
      </PrimaryButton>
    </TopicListItem>
  ));

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
          {selectedTopic.name}
          <RemoveIcon />
        </button>
      ))}
    </div>
  );
}

// Displays the topic that has been typed
const TypedTopic = ({
  topicSearchRef,
  setSelectedTopics,
  setDuplicateTopic,
  displayedTopics,
}) => {
  if (
    topicSearchRef.current === undefined ||
    topicSearchRef.current.lastChild.firstChild.firstChild.value.length === 0
  )
    return null;
  const topicInputValue =
    topicSearchRef.current.lastChild.firstChild.firstChild.value;
  return topicInputValue.length === 0 ? null : (
    <div className="create-post-typed-topic-container">
      <h4>{topicInputValue}</h4>
      <PrimaryButton
        onClick={() =>
          addTopicToPost(
            setSelectedTopics,
            topicInputValue,
            setDuplicateTopic,
            undefined,
            displayedTopics
          )
        }
        small
      >
        Select
      </PrimaryButton>
    </div>
  );
};

// Checks if the user already added the topic
// Checks if the user is adding a topic name that already exists
const addTopicToPost = (
  setSelectedTopics,
  topicName,
  setDuplicateTopic,
  topicID,
  displayedTopics
) => {
  let preExistingTopic = undefined;
  displayedTopics.forEach((displayedTopic) => {
    if (displayedTopic.name === topicName)
      preExistingTopic = [{name: displayedTopic.name, id: displayedTopic.id}];
  });

  setSelectedTopics((selectedTopics) => {
    const newTopic = [{name: topicName, id: topicID}];
    if (
      selectedTopics.some(
        (previouslySelectedTopic) =>
          previouslySelectedTopic.name === newTopic[0].name
      )
    ) {
      setDuplicateTopic(true);
      return selectedTopics;
    }
    let augmentedTopics;
    if (preExistingTopic !== undefined)
      augmentedTopics = [...selectedTopics, ...preExistingTopic];
    else {
      if (newTopic[0].id === undefined) newTopic[0].isNew = true;
      augmentedTopics = [...selectedTopics, ...newTopic];
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
