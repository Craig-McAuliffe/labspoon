import React, {useState, useContext, createContext, useEffect} from 'react';
import {AuthContext} from '../../../../App';
import PublicationPostForm, {
  submitCreatePostWithPublication,
} from './PublicationPostForm';
import {Redirect, useLocation} from 'react-router-dom';
import {getTweetTextFromRichText} from '../../../Article/Article';
import PostForm from './PostForm';
import {initialValueNoTitle} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import {PUBLICATION} from '../../../../helpers/resourceTypeDefinitions';
import {FilterableResultsContext} from '../../../FilterableResults/FilterableResults';
import {CreateIcon, SearchIconGrey} from '../../../../assets/HeaderIcons';
import TagTopics from '../../../Topics/TagTopics';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {CreatePostBackgroundSwirl} from '../../../../assets/Designs';
import TertiaryButton from '../../../Buttons/TertiaryButton';
import {RemoveIcon} from '../../../../assets/GeneralActionIcons';
import OpenPositionPostForm from './OpenPositionPostForm';
import DefaultPost from './DefaultPost';

import './CreatePost.css';

export const DEFAULT_POST = 'Other';
export const PUBLICATION_POST = 'Publication';
export const OPEN_POSITION_POST = 'Open Position';
export const EVENT_POST = 'Event';
export const PROJECT_GRANT_POST = 'Project / Grant';
export const QUESTION_POST = 'Question';
export const IDEA_POST = 'Idea';
export const MICRO_TOPIC_POST = 'Micro Topic';

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
  const [postType, setPostType] = useState(null);
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
    setPostType(DEFAULT_POST);
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
        cancelPost: cancelAction ? cancelPost : null,
        savedTitleText: savedTitleText,
        setSavedTitleText: setSavedTitleText,
        postType: postType,
        setPostType: setPostType,
      }}
    >
      <div className={locationPathname === '/' ? 'create-post-margin-top' : ''}>
        {preTaggedResourceType ? (
          <QuickCreatePostFromResource
            postType={preTaggedResourceType}
            taggedResourceDetails={preTaggedResourceDetails}
            onSuccess={onSuccess}
            preTaggedResourceID={preTaggedResourceID}
          />
        ) : (
          <GenericCreatePost postType={postType} setPostType={setPostType} />
        )}
      </div>
    </CreatingPostContext.Provider>
  );
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
  postType,
  taggedResourceDetails,
  preTaggedResourceID,
}) {
  const {selectedTopics, setPostSuccess, setSubmittingPost} = useContext(
    CreatingPostContext
  );

  const {setResults} = useContext(FilterableResultsContext);
  const submitChanges = async (res, isTweeting) => {
    switch (postType) {
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
    ></PostForm>
  );
}

export function SwitchTagMethod({isCreating, setIsCreating}) {
  return (
    <div className="create-post-switch-tagging-method-container">
      <button
        className="create-post-resource-search-button"
        type="button"
      ></button>
      <p>
        {isCreating ? 'Switch back' : "Can't find what you're looking for?"}
      </p>
      <button
        onClick={() => {
          setIsCreating((currentState) => !currentState);
        }}
        className={`create-post-quick-create-toggle${
          isCreating ? '-search' : '-create'
        }`}
        type="button"
      >
        {isCreating ? (
          <>
            Search <SearchIconGrey />
          </>
        ) : (
          <>
            Quick Create
            <CreateIcon hoverControl={true} />
          </>
        )}
      </button>
    </div>
  );
}

function GenericCreatePost() {
  const {
    submittingPost,
    setSelectedTopics,
    selectedTopics,
    postType,
    setPostType,
  } = useContext(CreatingPostContext);
  const [minimiseTagTopics, setMinimiseTagTopics] = useState(true);

  return (
    <>
      <div className="create-post-topic-section">
        {selectedTopics.length === 0 && (
          <h2 className="create-post-section-title">
            What topic are you posting about?
          </h2>
        )}

        {minimiseTagTopics && selectedTopics.length > 0 ? (
          <MainTopicAndTagMoreTopics
            selectedTopics={selectedTopics}
            setMinimiseTagTopics={setMinimiseTagTopics}
            setSelectedTopics={setSelectedTopics}
          />
        ) : (
          <TagTopics
            submittingForm={submittingPost}
            setSelectedTopics={setSelectedTopics}
            selectedTopics={selectedTopics}
            largeDesign={true}
          />
        )}
      </div>
      <div className="create-post-hidden-overlap">
        {selectedTopics.length > 0 && (
          <>
            <div className="create-post-type-section">
              {!postType && (
                <h2 className="create-post-section-title-2">
                  What type of post is this?
                </h2>
              )}
              <TypeOfTaggedResourceDropDown
                setTaggedResourceType={setPostType}
                taggedResourceType={postType}
              />
            </div>
            <div className="create-post-type-section-height-match"></div>
          </>
        )}
        {postType ? (
          <div className="create-post-form-section">
            {submittingPost ? (
              <div className="create-post-loading-spinner">
                <LoadingSpinner />
              </div>
            ) : null}
            <div
              className={
                submittingPost ? 'create-post-loading-greyed-out' : null
              }
            >
              <PostTypeSpecificForm postType={postType} />
            </div>
          </div>
        ) : (
          <div className="create-post-background-swirl-container">
            <CreatePostBackgroundSwirl
              disappearEffect={selectedTopics.length > 0}
            />
          </div>
        )}
      </div>
    </>
  );
}

function MainTopicAndTagMoreTopics({
  selectedTopics,
  setSelectedTopics,
  setMinimiseTagTopics,
}) {
  return (
    <>
      <PostSectionSelectedTypeTopic
        removeAction={() => setSelectedTopics([])}
        title={selectedTopics[0].name}
      />
      <div className="create-post-tag-more-topics-button-container">
        <TertiaryButton onClick={() => setMinimiseTagTopics(false)}>
          Tag additional topics
        </TertiaryButton>
      </div>
    </>
  );
}

export function PostSectionSelectedTypeTopic({title, removeAction}) {
  return (
    <h2 className="create-post-primary-selected-topic-type">
      <button
        className="create-post-primary-selected-topic-type-button"
        onClick={removeAction}
      >
        {title}
        <RemoveIcon />
      </button>
    </h2>
  );
}
function PostTypeSpecificForm({postType}) {
  switch (postType) {
    case PUBLICATION_POST: {
      return <PublicationPostForm />;
    }
    case OPEN_POSITION_POST: {
      return <OpenPositionPostForm />;
    }
    default: {
      return <DefaultPost />;
    }
  }
}
