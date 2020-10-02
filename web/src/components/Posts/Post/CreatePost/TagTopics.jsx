import React, {useEffect, useRef, useState} from 'react';

import './CreatePost.css';

export default function TagTopics({setSelectedTopics}) {
  const [duplicateTopic, setDuplicateTopic] = useState(false);
  const tagTopicInputRef = useRef();

  useEffect(() => {
    if (duplicateTopic) {
      setTimeout(() => setDuplicateTopic(false), 3000);
    }
  }, [duplicateTopic]);

  const addTopicToPost = () => {
    setSelectedTopics((selectedTopics) => {
      const newTopic = [{name: tagTopicInputRef.current.value, id: undefined}];
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
  return (
    <>
      <h4>Enter topics that you want to add or search for existing ones</h4>
      {duplicateTopic ? (
        <div className="topic-tag-duplicate-topic-warning">
          You have already added that topic
        </div>
      ) : null}
      <div className="post-tag-topics-container">
        <input className="form-text-input" ref={tagTopicInputRef} type="text" />
        <button onClick={addTopicToPost} type="button">
          Add Topic
        </button>
      </div>
    </>
  );
}
