import React, {useContext, useState} from 'react';
import NegativeButton from '../../../Buttons/NegativeButton';
import * as Yup from 'yup';
import firebase from '../../../../firebase';
import {CreatePostTextArea, TextInput} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import {CreatingPostContext} from './CreatePost';
import {FormPublicationResults} from '../../../Publication/MicrosoftResults';
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
        console.log(err);
        alert(
          'Oh dear, something went wrong trying to create your post. Please try again later.'
        );
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
      <div className="creating-post-tags">
        <TextInput
          value={query}
          label={'Search Publications:'}
          sideLabel={true}
          onChange={(event) => setQuery(event.target.value)}
          className="search-input"
        />
      </div>
      <div className="create-publication-post-search-or-link-container">
        <button className="create-publication-search-publications-button"></button>
        <p>Can&rsquo;t find the publication you&rsquo;re looking for?</p>
        <button
          onClick={() => {
            setUsePublicationURL(true);
          }}
          small
        >
          <h4>Add Link Instead</h4>
        </button>
      </div>
      <FormPublicationResults query={query} setPublication={setPublication} />
    </>
  );
}

function PublicationURL({
  publicationURL,
  setPublicationURL,
  setUsePublicationURL,
}) {
  return (
    <div className="creating-post-tags">
      <TextInput
        value={publicationURL}
        label={'Publication URL:'}
        sideLabel={true}
        onChange={(event) => setPublicationURL(event.target.value)}
        className="search-input"
      />
      <div className="create-publication-post-search-or-link-container">
        <p>Search for a publication instead?</p>
        <button
          onClick={() => {
            setUsePublicationURL(false);
          }}
          small
        >
          <h4>Find on Labspoon</h4>
        </button>
      </div>
    </div>
  );
}
