import React, {useState, useEffect} from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import TopicListItem from './TopicListItem';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import SearchMSFields from './SearchMSFields';

import '../Posts/Post/CreatePost/CreatePost.css';

export default function TagTopics({
  submittingForm,
  selectedTopics,
  setSelectedTopics,
}) {
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const [typedTopic, setTypedTopic] = useState('');

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

  return (
    <div className="create-post-topic-section-container">
      <SelectedTopics
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
      />
      {duplicateTopic ? <DuplicateTopicWarning /> : null}
      <div className="create-post-topic-search-container">
        <h4 className="create-post-topic-tag-title">Add related topics</h4>
        <SearchMSFields
          placeholder="this post is about..."
          setFetchedTopics={setDisplayedTopics}
          setCurrentInputValue={setTypedTopic}
        />
      </div>
      <div>
        <TopicsList
          topics={displayedTopics}
          setSelectedTopics={setSelectedTopics}
          setDuplicateTopic={setDuplicateTopic}
          displayedTopics={displayedTopics}
        />
        <TypedTopic
          typedTopic={typedTopic}
          setSelectedTopics={setSelectedTopics}
          setDuplicateTopic={setDuplicateTopic}
          displayedTopics={displayedTopics}
        />
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
          {selectedTopic.name}
          <RemoveIcon />
        </button>
      ))}
    </div>
  );
}

// Displays the topic that has been typed
const TypedTopic = ({
  typedTopic,
  setSelectedTopics,
  setDuplicateTopic,
  displayedTopics,
}) => {
  return typedTopic.length === 0 ? null : (
    <div className="create-post-typed-topic-container">
      <h4>{typedTopic}</h4>
      <button
        type="button"
        onClick={() =>
          addTopicToPost(
            setSelectedTopics,
            typedTopic,
            setDuplicateTopic,
            undefined,
            undefined,
            displayedTopics
          )
        }
        small
      >
        Select
      </button>
    </div>
  );
};

// Checks if the user already added the topic
// Checks if the user is adding a topic name that already exists
const addTopicToPost = (
  setSelectedTopics,
  topicName,
  setDuplicateTopic,
  microsoftID,
  normalisedTopicName,
  displayedTopics
) => {
  let preExistingTopic = undefined;
  if (microsoftID === undefined) {
    displayedTopics.forEach((displayedTopic) => {
      if (displayedTopic.name === topicName)
        preExistingTopic = [
          {
            name: displayedTopic.name,
            microsoftID: displayedTopic.microsoftID,
            normalisedName: displayedTopic.normalisedName,
          },
        ];
    });
  }
  setSelectedTopics((selectedTopics) => {
    const newSelectedTopic = {
      name: topicName,
      microsoftID: microsoftID,
      normalisedName: normalisedTopicName,
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
