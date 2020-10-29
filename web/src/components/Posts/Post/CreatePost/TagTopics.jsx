import React, {useState, useEffect, useContext} from 'react';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import TopicListItem from '../../../Topics/TopicListItem';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {CreatingPostContext} from './CreatePost';
import firebase from '../../../../firebase';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import './CreatePost';

const topicSearch = firebase.functions().httpsCallable('topics-topicSearch');
// Using microsoft field names here as that is what we are returning from
// search and sending to db.
// microsoftFieldName = 'DFN'
// microsoftStandardisedFieldName = 'FN'
// microsoftFieldID = 'FId'
export default function TagTopics({submittingPost}) {
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

  useEffect(() => {
    if (typedTopic.length === 0 || submittingPost) {
      setDisplayedTopics([]);
      setLoadingTopics(false);
      return;
    }
    return searchMicrosoftTopics(
      typedTopic,
      setLoadingTopics,
      setDisplayedTopics
    );
  }, [typedTopic, submittingPost]);

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
          onChange={(e) => {
            setTypedTopic(e.target.value);
          }}
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
    <TopicListItem key={displayedTopic.FId} topic={displayedTopic} noLink>
      <PrimaryButton
        onClick={() =>
          addTopicToPost(
            setSelectedTopics,
            displayedTopic.DFN,
            setDuplicateTopic,
            displayedTopic.FId,
            displayedTopic.FN,
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

// clearTimeout is called on unmount from useEffect hook
const searchMicrosoftTopics = (query, setLoadingTopics, setDisplayedTopics) => {
  setLoadingTopics(true);
  const apiCallTimeout = setTimeout(
    () =>
      topicSearch({topicQuery: query})
        .then((microsoftTopics) => {
          setLoadingTopics(false);
          setDisplayedTopics(microsoftTopics.data);
        })
        .catch((err) => {
          setLoadingTopics(false);
          setDisplayedTopics([]);
          console.log(err, 'could not search topics');
        }),
    1400
  );
  return () => clearTimeout(apiCallTimeout);
};

function SelectedTopics({selectedTopics, setSelectedTopics}) {
  return (
    <div className="create-post-tagged-topics-container">
      {selectedTopics.map((selectedTopic) => (
        <button
          key={selectedTopic.DFN}
          className="create-post-tagged-topic"
          onClick={() =>
            removeSelectedTopic(
              selectedTopic.DFN,
              selectedTopics,
              setSelectedTopics
            )
          }
        >
          {selectedTopic.DFN}
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
      if (displayedTopic.DFN === topicName)
        preExistingTopic = [
          {
            DFN: displayedTopic.DFN,
            FId: displayedTopic.FId,
            FN: displayedTopic.FN,
          },
        ];
    });
  }
  setSelectedTopics((selectedTopics) => {
    const newSelectedTopic = {
      DFN: topicName,
      FId: microsoftID,
      FN: normalisedTopicName,
    };
    if (
      selectedTopics.some(
        (previouslySelectedTopic) =>
          previouslySelectedTopic.DFN === newSelectedTopic.DFN
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
      previouslySelectedTopic.DFN === selectedTopicName
  );
  setSelectedTopics((previouslySelectedTopics) => {
    const curatedSelectedTopics = [...previouslySelectedTopics];
    curatedSelectedTopics.splice(indexToBeRemoved, 1);
    if (curatedSelectedTopics.length === 0) return [];
    return curatedSelectedTopics;
  });
};
