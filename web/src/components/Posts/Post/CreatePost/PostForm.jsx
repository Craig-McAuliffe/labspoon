import React, {useState, useRef, useEffect} from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import PostTypeDropDown from './PostTypeDropDown';
import {Form, Formik} from 'formik';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import TopicListItem from '../../../Topics/TopicListItem';

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
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const topicSearchRef = useRef();

  useEffect(() => {
    if (duplicateTopic) {
      setTimeout(() => setDuplicateTopic(false), 3000);
    }
  }, [duplicateTopic]);

  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="create-post-form">{children}</Form>
      </Formik>
      <div className="create-post-tagged-topics">
        {selectedTopics.map((selectedTopic) => (
          <div key={selectedTopic.id}>{selectedTopic.name}</div>
        ))}
      </div>
      {duplicateTopic ? (
        <div className="topic-tag-duplicate-topic-warning">
          You have already added that topic
        </div>
      ) : null}
      <h4>Search for topics to add to your post</h4>
      <div className="creating-post-topic-search-container">
        <FormDatabaseSearch
          setDisplayedItems={setDisplayedTopics}
          indexName="_TOPICS"
          inputRef={topicSearchRef}
          placeholderText="Look through existing topics"
        />
      </div>
      <div className="create-post-searched-topics-container">
        {topicSearchRef.current ? (
          <div className="create-post-typed-topic-container">
            <h4>
              {topicSearchRef.current.lastChild.firstChild.firstChild.value}
            </h4>
            <PrimaryButton
              onClick={() =>
                addTopicToPost(
                  setSelectedTopics,
                  topicSearchRef.current.lastChild.firstChild.firstChild.value,
                  setDuplicateTopic
                )
              }
              small
            >
              Select
            </PrimaryButton>
          </div>
        ) : null}
        {displayedTopics.map((displayedTopic) => (
          <TopicListItem key={displayedTopic.id} topic={displayedTopic}>
            <button
              onClick={() =>
                setSelectedTopics((selectedTopics) =>
                  selectedTopics.push(displayedTopic)
                )
              }
            >
              Select
            </button>
          </TopicListItem>
        ))}
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

const addTopicToPost = (setSelectedTopics, topicName, setDuplicateTopic) => {
  setSelectedTopics((selectedTopics) => {
    const newTopic = [{name: topicName, id: undefined}];
    if (
      selectedTopics.some(
        (previouslySelectedTopic) =>
          previouslySelectedTopic.name === newTopic[0].name
      )
    ) {
      setDuplicateTopic(true);
      return selectedTopics;
    }
    const augmentedTopics = [...selectedTopics, ...newTopic];
    return augmentedTopics;
  });
};
