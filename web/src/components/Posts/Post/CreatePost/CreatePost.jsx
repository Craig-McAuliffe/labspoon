import React, {useState, useContext, createContext, useEffect} from 'react';
import {AuthContext} from '../../../../App';
import DefaultPost from './DefaultPost';
import PublicationPostForm, {
  submitCreatePostWithPublication,
} from './PublicationPostForm';
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
  redirect = undefined,
  preTaggedResourceType,
  preTaggedResourceDetails,
  onSuccess,
  preTaggedResourceID,
  cancelAction,
}) {
  const {user, userProfile} = useContext(AuthContext);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [postSuccess, setPostSuccess] = useState(false);
  const [taggedResourceType, setTaggedResourceType] = useState(DEFAULT_POST);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [savedTitleText, setSavedTitleText] = useState();
  const locationPathname = useLocation().pathname;

  const cancelPost = () => {
    if (submittingPost) return;
    if (cancelAction) return cancelAction();
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
  }, []);

  if (postSuccess && redirect) {
    return redirect;
  }

  if (!user) return null;
  if (userProfile && !userProfile.name) return <Redirect to="/userName" />;
  return (
    <CreatingPostContext.Provider
      value={{
        selectedTopics: selectedTopics,
        setSelectedTopics: setSelectedTopics,
        setPostSuccess: setPostSuccess,
        submittingPost: submittingPost,
        setSubmittingPost: setSubmittingPost,
        cancelPost: cancelPost,
        savedTitleText: savedTitleText,
        setSavedTitleText: setSavedTitleText,
      }}
    >
      <div className={locationPathname === '/' ? 'create-post-margin-top' : ''}>
        {preTaggedResourceType ? (
          <QuickCreatePostFromResource
            taggedResourceType={preTaggedResourceType}
            taggedResourceDetails={preTaggedResourceDetails}
            onSuccess={onSuccess}
            preTaggedResourceID={preTaggedResourceID}
          />
        ) : (
          <PostTypeSpecificForm
            postType={taggedResourceType}
            setPostType={setTaggedResourceType}
          />
        )}
      </div>
    </CreatingPostContext.Provider>
  );
}

function PostTypeSpecificForm({postType, setPostType}) {
  switch (postType) {
    case DEFAULT_POST:
      return <DefaultPost setPostType={setPostType} postType={postType} />;
    case PUBLICATION_POST:
      return (
        <PublicationPostForm setPostType={setPostType} postType={postType} />
      );
    case OPEN_POSITION_POST:
      return (
        <OpenPositionPostForm setPostType={setPostType} postType={postType} />
      );
    default:
      return <DefaultPost setPostType={setPostType} postType={postType} />;
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
