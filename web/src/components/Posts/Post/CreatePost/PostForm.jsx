import React, {useState} from 'react';
import CancelButton from '../../../Buttons/CancelButton';
import PrimaryButton from '../../../Buttons/PrimaryButton';
import PostTypeDropDown from './PostTypeDropDown';
import TagTopics from './TagTopics';
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
  return (
    <div className="creating-post-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="create-post-form">
          {children}
          <TagTopics setSelectedTopics={setSelectedTopics} />
        </Form>
      </Formik>
      <div className="create-post-tagged-topics">
        {Array.isArray(selectedTopics)
          ? selectedTopics.map((selectedTopic) => (
              <div key={selectedTopic.id}>{selectedTopic.name}</div>
            ))
          : null}
      </div>
      <div className="creating-post-topic-search-container">
        <FormDatabaseSearch
          setDisplayedItems={setDisplayedTopics}
          indexName="_TOPICS"
          placeholderText="Look through existing topics"
        />
      </div>
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
