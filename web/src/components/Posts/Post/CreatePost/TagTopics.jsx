import React, {useState, useEffect, useContext} from 'react';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import TopicListItem from '../../../Topics/TopicListItem';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {CreatingPostContext} from './CreatePost';
import firebase from '../../../../firebase';
import {v4 as uuid} from 'uuid';
import {db} from '../../../../firebase';
import './CreatePost';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';

const test = firebase.functions().httpsCallable('topics-topicSearch');

export default function TagTopics() {
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [typedTopic, setTypedTopic] = useState('');
  const {selectedTopics, setSelectedTopics} = useContext(CreatingPostContext);

  // Tells user that they are trying to input a duplicate topic
  useEffect(() => {
    if (duplicateTopic) {
      setTimeout(() => setDuplicateTopic(false), 3000);
    }
  }, [duplicateTopic]);

  const searchMicrosoftTopics = (e) => {
    const topicInputValue = e.target.value;
    setTypedTopic(topicInputValue);
    setLoadingTopics(true);
    if (topicInputValue.length === 0) {
      setDisplayedTopics([]);
      return;
    }
    test({topicQuery: topicInputValue})
      .then((microsoftTopics) => {
        setLoadingTopics(false);
        setDisplayedTopics(microsoftTopics.data);
      })
      .catch((err) => {
        setLoadingTopics(false);
        setDisplayedTopics([]);
        console.log(err, 'could not search topics');
      });
  };
  return (
    <div className="create-post-topic-section-container">
      <SelectedTopics
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
      />
      {duplicateTopic ? <DuplicateTopicWarning /> : null}
      <div className="create-post-topic-search-container">
        <h4 className="create-post-topic-tag-title">Add related topics</h4>
        <input
          type="text"
          className="create-post-topic-search-input"
          onChange={(e) => searchMicrosoftTopics(e)}
          placeholder="this post is about..."
        />
        <div></div>
        <div className="create-post-searched-topics-container">
          {loadingTopics === true ? (
            <div className="create-post-loading-spinner-container">
              <LoadingSpinner />
            </div>
          ) : null}
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
      microsoftTopic
    >
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
  typedTopic,
  setSelectedTopics,
  setDuplicateTopic,
  displayedTopics,
}) => {
  return typedTopic.length === 0 ? null : (
    <div className="create-post-typed-topic-container">
      <h4>{typedTopic}</h4>
      <button
        onClick={() =>
          addTopicToPost(
            setSelectedTopics,
            typedTopic,
            setDuplicateTopic,
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

export function addTaggedTopicToDB(selectedTopic) {
  if (selectedTopic.id === undefined) selectedTopic.id = uuid();
  if (selectedTopic.isNew) {
    delete selectedTopic.isNew;
    db.doc(`topics/${selectedTopic.id}`).set(selectedTopic);
  }
}
