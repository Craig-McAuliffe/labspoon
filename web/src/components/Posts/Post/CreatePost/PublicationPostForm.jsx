import React, {useContext, useState} from 'react';
import NegativeButton from '../../../Buttons/NegativeButton';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import {CreatePostTextArea, TextInput} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import {CreatingPostContext, sortThrownCreatePostErrors} from './CreatePost';
import {PublicationSearchAfterDelayAndResults} from '../../../Publication/MicrosoftResults';
import {handlePostTopics} from '../../../Topics/TagTopics';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {SmallPublicationListItem} from '../../../Publication/PublicationListItem';

import './CreatePost.css';

const createPost = firebase.functions().httpsCallable('posts-createPost');

export default function PublicationPostForm({
  setCreatingPost,
  postType,
  setPostType,
}) {
  const {selectedTopics, setSubmittingPost, setPostSuccess} = useContext(
    CreatingPostContext
  );
  const [publication, setPublication] = useState();
  const [usePublicationURL, setUsePublicationURL] = useState(false);
  const [publicationURL, setPublicationURL] = useState();
  const submitChanges = (res) => {
    if (!(publication || publicationURL)) {
      return alert('Must select a publication or provide a publication URL');
    } else if (publication) {
      res.publication = publication;
    } else {
      res.publicationURL = publicationURL;
    }
    res.postType = {id: 'publicationPost', name: 'Publication'};
    const taggedTopics = handlePostTopics(selectedTopics);
    res.customTopics = taggedTopics.customTopics;
    res.topics = taggedTopics.DBTopics;
    createPost(res)
      .then(() => {
        setCreatingPost(false);
        setPostSuccess(true);
        setSubmittingPost(false);
      })
      .catch((err) => {
        sortThrownCreatePostErrors(err);
        setSubmittingPost(false);
      });
  };

  const initialValues = {
    title: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('You need to write something!')
      .max(
        1500,
        'Your post is too long. It must have fewer than 1500 characters.'
      ),
  });

  return (
    <PostForm
      onSubmit={submitChanges}
      initialValues={initialValues}
      validationSchema={validationSchema}
      formID="create-publication-post-form"
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
      <TypeOfTaggedResourceDropDown
        setTaggedResourceType={setPostType}
        taggedResourceType={postType}
      />
      {usePublicationURL ? (
        <PublicationURL
          usePublicationURL={usePublicationURL}
          setUsePublicationURL={setUsePublicationURL}
          publicationURL={publicationURL}
          setPublicationURL={setPublicationURL}
        />
      ) : (
        <SelectPublication
          publication={publication}
          setPublication={setPublication}
          usePublicationURL={usePublicationURL}
          setUsePublicationURL={setUsePublicationURL}
        />
      )}
    </PostForm>
  );
}

function SelectPublication({
  publication,
  setPublication,
  setUsePublicationURL,
}) {
  const [query, setQuery] = useState();
  if (publication) {
    return (
      <div className="create-publication-post-list-item-container">
        <SmallPublicationListItem publication={publication} />
        <div className="create-publication-post-list-item-select-container">
          <NegativeButton
            onClick={() => {
              setQuery(undefined);
              setPublication(undefined);
            }}
            smallVersion
          >
            Deselect
          </NegativeButton>
        </div>
      </div>
    );
  }
  // The "search" button is just there to prevent search/url switch
  // if the user clicks enter
  return (
    <>
      <div className="publication-post-search-section">
        <TextInput
          value={query}
          label={'Search Publications:'}
          sideLabel={true}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="create-post-alt-tagging-method-container">
        <button className="create-publication-search-publications-button"></button>
        <p>Can&#39;t find the publication you&#39;re looking for?</p>
        <button
          onClick={() => {
            setUsePublicationURL(true);
          }}
        >
          <h4>Add Link Instead</h4>
        </button>
      </div>
      <PublicationSearchAfterDelayAndResults
        query={query}
        setPublication={setPublication}
      />
    </>
  );
}

function PublicationURL({
  publicationURL,
  setPublicationURL,
  setUsePublicationURL,
}) {
  return (
    <div className="publication-post-search-section">
      <TextInput
        value={publicationURL}
        label={'Publication URL:'}
        sideLabel={true}
        onChange={(event) => setPublicationURL(event.target.value)}
      />
      <div className="create-post-alt-tagging-method-container">
        <p>Search for a publication instead?</p>
        <button
          onClick={() => {
            setUsePublicationURL(false);
          }}
        >
          <h4>Find on Labspoon</h4>
        </button>
      </div>
    </div>
  );
}
