import React, {useState, useContext, createContext, useEffect} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import PublicationPostForm, {
  submitCreatePostWithPublication,
} from './PublicationPostForm';
import {WriteIcon} from '../../../../assets/GeneralActionIcons';
import {Redirect, useLocation} from 'react-router-dom';
import OpenPositionPostForm from './OpenPositionPostForm';
import {getTweetTextFromRichText} from '../../../Article/Article';
import PostForm from './PostForm';
import {CreatePostTextArea} from '../../../Forms/FormTextInput';
import {initialValueNoTitle} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import {PUBLICATION} from '../../../../helpers/resourceTypeDefinitions';
import {FilterableResultsContext} from '../../../FilterableResults/FilterableResults';

import './CreatePost.css';

export const DEFAULT_POST = 'Default';
export const PUBLICATION_POST = 'Publication';
export const OPEN_POSITION_POST = 'Open Position';

export const CreatingPostContext = createContext();
export const MAX_POST_CHARACTERS = 800;
export default function CreatePost({
  pinnedPost,
  keepExpanded = false,
  redirect = undefined,
  preTaggedResourceType,
  preTaggedResourceDetails,
  onSuccess,
  preTaggedResourceID,
  cancelAction,
  startExpanded,
}) {
  const {user, userProfile} = useContext(AuthContext);
  const [creatingPost, setCreatingPost] = useState(() => {
    if (startExpanded || keepExpanded) return true;
    return false;
  });
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [postSuccess, setPostSuccess] = useState(false);
  const [taggedResourceType, setTaggedResourceType] = useState(DEFAULT_POST);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [savedTitleText, setSavedTitleText] = useState();
  const locationPathname = useLocation().pathname;
  const setCreatingPostIfNotExpanded = (newValue) => {
    if (!keepExpanded) setCreatingPost(newValue);
  };

  const cancelPost = () => {
    if (submittingPost) return;
    if (cancelAction) return cancelAction();
    if (!keepExpanded) setCreatingPostIfNotExpanded(false);
  };

  useEffect(() => {
    if (!postSuccess) return;
    if (onSuccess) onSuccess();
    setSavedTitleText();
    setTaggedResourceType(DEFAULT_POST);
    setTimeout(() => setPostSuccess(false), 3000);
  }, [postSuccess]);

  useEffect(() => {
    setSelectedTopics([]);
  }, [creatingPost]);

  if (postSuccess && redirect) {
    return redirect;
  }

  if (!user) return null;
  if (userProfile && !userProfile.name) return <Redirect to="/userName" />;
  if (creatingPost)
    return (
      <CreatingPostContext.Provider
        value={{
          selectedTopics: selectedTopics,
          setSelectedTopics: setSelectedTopics,
          setPostSuccess: setPostSuccess,
          submittingPost: submittingPost,
          setSubmittingPost: setSubmittingPost,
          cancelPost: keepExpanded ? undefined : cancelPost,
          savedTitleText: savedTitleText,
          setSavedTitleText: setSavedTitleText,
        }}
      >
        <div
          className={locationPathname === '/' ? 'create-post-margin-top' : ''}
        >
          {preTaggedResourceType ? (
            <QuickCreatePostFromResource
              taggedResourceType={preTaggedResourceType}
              taggedResourceDetails={preTaggedResourceDetails}
              onSuccess={onSuccess}
              preTaggedResourceID={preTaggedResourceID}
            />
          ) : (
            <PostTypeSpecificForm
              setCreatingPost={setCreatingPostIfNotExpanded}
              postType={taggedResourceType}
              setPostType={setTaggedResourceType}
            />
          )}
        </div>
      </CreatingPostContext.Provider>
    );
  else
    return pinnedPost ? (
      <button
        onClick={() => setCreatingPost(true)}
        className="create-pinned-post-button"
      >
        <WriteIcon />
        <h3>Create Pinned Post</h3>
      </button>
    ) : (
      <button
        onClick={() => setCreatingPost(true)}
        className="not-creating-post-button"
      >
        <WriteIcon />
        <p className="not-creating-post-text">Post to your followers...</p>
        {postSuccess ? (
          <h4 className="post-success-message">Post Created!</h4>
        ) : null}
      </button>
    );
}

function PostTypeSpecificForm({setCreatingPost, postType, setPostType}) {
  switch (postType) {
    case DEFAULT_POST:
      return (
        <DefaultPost
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case PUBLICATION_POST:
      return (
        <PublicationPostForm
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    case OPEN_POSITION_POST:
      return (
        <OpenPositionPostForm
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
    default:
      return (
        <DefaultPost
          setCreatingPost={setCreatingPost}
          setPostType={setPostType}
          postType={postType}
        />
      );
  }
}

export function sortThrownCreatePostErrors(err) {
  console.error(err);
  switch (err.code) {
    case 'unavailable':
      if (err.message.includes('limit'))
        alert(
          'You have reached the daily post limit. This will be reset sometime in the next 24 hours.'
        );
      else
        alert(
          'You are posting too fast. Please wait at least 10 seconds between posts.'
        );
      break;
    default:
      alert(
        'Oh dear, something went wrong trying to create your post. Please try again later.'
      );
  }
}

export function getTweetPostURL(text, topics) {
  const commaSeparatedTopics = topics
    .map((topic) => topic.name)
    .join(',')
    .replace(/\s/g, '')
    .replace('-', '')
    .replace('(', '')
    .replace(')', '')
    .replace(',', '');
  return `https://twitter.com/intent/tweet?text=${text}&hashtags=${commaSeparatedTopics}&via=Labspoon`;
}

export function validateTweetPostLength(textLength, topics) {
  const commaSeparatedTopics = topics.map((topic) => topic.name).join(',');
  const topicsLength = commaSeparatedTopics.replace(',', ' #').length;
  if (topicsLength + textLength > 280 - ' via @Labspoon '.length) return false;
  return true;
}

export function openTwitterWithPopulatedTweet(richText, topics) {
  window.open(
    getTweetPostURL(getTweetTextFromRichText(richText), topics),
    '_blank'
  );
}

export function QuickCreatePostFromResource({
  taggedResourceType,
  taggedResourceDetails,
  preTaggedResourceID,
}) {
  const {selectedTopics, setPostSuccess, setSubmittingPost} = useContext(
    CreatingPostContext
  );

  const {setResults} = useContext(FilterableResultsContext);
  const submitChanges = async (res, isTweeting) => {
    switch (taggedResourceType) {
      case PUBLICATION:
        res[PUBLICATION] = taggedResourceDetails;
        res[PUBLICATION].id = preTaggedResourceID;
        return submitCreatePostWithPublication(
          res,
          isTweeting,
          undefined,
          setPostSuccess,
          setSubmittingPost,
          undefined,
          undefined,
          undefined,
          selectedTopics,
          setResults
        );
      default: {
        setSubmittingPost(false);
        alert(
          'Something went wrong. If the problem persists, let us know through the contact page.'
        );
      }
    }
  };

  const initialValues = {title: initialValueNoTitle};
  return (
    <PostForm
      onSubmit={submitChanges}
      initialValues={initialValues}
      formID="create-default-post-form"
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
    </PostForm>
  );
}
