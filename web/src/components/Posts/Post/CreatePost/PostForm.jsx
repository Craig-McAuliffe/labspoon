import React, {useState, useRef, useEffect, useContext} from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import PostTypeDropDown from './PostTypeDropDown';
import {Form, Formik} from 'formik';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import TopicListItem from '../../../Topics/TopicListItem';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import {SelectedTopicsContext} from './CreatePost';

import './CreatePost';
export default function PostForm({
  children,
  onSubmit,
  initialValues,
  validationSchema,
  cancelPost,
  postType,
  setPostType,
}) {
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const topicSearchRef = useRef();
  const {selectedTopics, setSelectedTopics} = useContext(SelectedTopicsContext);

  useEffect(() => {
    if (duplicateTopic) {
      setTimeout(() => setDuplicateTopic(false), 3000);
    }
  }, [duplicateTopic]);

  const typedTopic = () => {
    if (
      topicSearchRef.current === undefined ||
      topicSearchRef.current.lastChild.firstChild.firstChild.value.length === 0
    )
      return null;
    return topicSearchRef.current.lastChild.firstChild.firstChild.value
      .length === 0 ? null : (
      <div className="create-post-typed-topic-container">
        <h4>{topicSearchRef.current.lastChild.firstChild.firstChild.value}</h4>
        <PrimaryButton
          onClick={() =>
            addTopicToPost(
              setSelectedTopics,
              topicSearchRef.current.lastChild.firstChild.firstChild.value,
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

  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="create-post-form">{children}</Form>
      </Formik>
      <div className="create-post-topic-section-container">
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
        {duplicateTopic ? (
          <div className="topic-tag-duplicate-topic-warning">
            You have already added that topic
          </div>
        ) : null}
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
              {typedTopic()}
              {displayedTopics.map((displayedTopic) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="create-post-actions">
        <div className="create-post-cancel-container">
          <CancelButton cancelAction={cancelPost} />
        </div>
        <div className="create-post-actions-positive">
          <PostTypeDropDown setPostType={setPostType} postType={postType} />
          <PrimaryButton submit={true} formID="create-post-form">
            Post
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

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
