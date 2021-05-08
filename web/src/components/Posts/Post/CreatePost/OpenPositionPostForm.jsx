import React, {useContext, useEffect, useState} from 'react';
import firebase, {db} from '../../../../firebase';
import {TextInput} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import * as Yup from 'yup';
import {
  CreatingPostContext,
  sortThrownCreatePostErrors,
  openTwitterWithPopulatedTweet,
  SwitchTagMethod,
  OptionalTagResource,
} from './CreatePost';

import './CreatePost.css';
import {ReducedOpenPositionListItem} from '../../../OpenPosition/OpenPositionListItem';
import NegativeButton from '../../../Buttons/NegativeButton';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import InputError from '../../../Forms/InputError';
import SecondaryButton from '../../../Buttons/SecondaryButton';
import {TagResourceIcon} from '../../../../assets/ResourceTypeIcons';
import {
  algoliaOpenPosToDBOpenPosListItem,
  openPosToOpenPosListItem,
} from '../../../../helpers/openPositions';
import {SelectedGroup} from '../../../Forms/Groups/SelectGroup';
import {
  SelectPosition,
  HowToApply,
  POSITIONS,
} from '../../../OpenPosition/CreateOpenPosition';
import {AuthContext} from '../../../../App';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import {convertGroupToGroupRef} from '../../../../helpers/groups';
import {Alert} from 'react-bootstrap';
import {
  getTweetTextFromRichText,
  MAX_ARTICLE_CHARACTERS,
} from '../../../Article/Article';
import {
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import SelectGroup from '../../../Group/SelectGroup';
import {env} from '../../../../config';
import {OPENPOSITION} from '../../../../helpers/resourceTypeDefinitions';

const createPost = firebase.functions().httpsCallable('posts-createPost');
const createOpenPosition = firebase
  .functions()
  .httpsCallable('openPositions-createOpenPosition');

export default function OpenPositionPostForm() {
  const {
    selectedTopics,
    setPostSuccess,
    setSubmittingPost,
    savedTitleText,
    setPostCreateDataResp,
  } = useContext(CreatingPostContext);
  const [taggedOpenPosition, setTaggedOpenPosition] = useState();
  const [isQuickCreatingOpenPos, setIsQuickCreatingOpenPos] = useState(false);
  const [openPosSubmissionError, setOpenPosSubmissionError] = useState(false);
  const [openPosSuccessfullyCreated, setOpenPosSuccessfullyCreated] = useState(
    null
  );
  const [openPosFormatErrors, setOpenPosFormatErrors] = useState([]);
  const [quickOpenPosition, setQuickOpenPosition] = useState({
    title: '',
    applyEmail: '',
    applyLink: '',
    description: initialValueNoTitle,
    position: '',
  });
  const [generalError, setGeneralError] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [postSubmissionError, setPostSubmissionError] = useState(false);
  const [isTaggingOpenPosition, setIsTaggingOpenPosition] = useState(false);

  useEffect(() => {
    if (!generalError) return;
    alert(
      'Something went wrong while creating your post. Sorry about that. Please try again and contact support if the problem persists.'
    );
    setGeneralError(false);
  }, [generalError]);

  const initialValues = {
    title: savedTitleText ? savedTitleText : initialValueNoTitle,
  };

  const submitChanges = (res, isTweeting) =>
    submitOpenPosPost(
      res,
      isTweeting,
      setPostSuccess,
      selectedTopics,
      setSubmittingPost,
      openPosSubmissionError,
      setOpenPosSubmissionError,
      quickOpenPosition,
      setQuickOpenPosition,
      openPosSuccessfullyCreated,
      setOpenPosSuccessfullyCreated,
      isQuickCreatingOpenPos,
      setIsQuickCreatingOpenPos,
      openPosFormatErrors,
      setOpenPosFormatErrors,
      selectedGroup,
      postSubmissionError,
      setPostSubmissionError,
      taggedOpenPosition,
      isTaggingOpenPosition,
      setPostCreateDataResp
    );

  return (
    <>
      <PostForm
        onSubmit={submitChanges}
        initialValues={initialValues}
        formID="create-openPosition-post-form"
      >
        {isTaggingOpenPosition ? (
          <SelectOpenPosition
            setTaggedOpenPosition={setTaggedOpenPosition}
            taggedOpenPosition={taggedOpenPosition}
            isQuickCreatingOpenPos={isQuickCreatingOpenPos}
            setIsQuickCreatingOpenPos={setIsQuickCreatingOpenPos}
            openPosSuccessfullyCreated={openPosSuccessfullyCreated}
            openPosFormatErrors={openPosFormatErrors}
            quickOpenPosition={quickOpenPosition}
            setQuickOpenPosition={setQuickOpenPosition}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            postSubmissionError={postSubmissionError}
            cancelTagging={() => setIsTaggingOpenPosition(false)}
          />
        ) : (
          <OptionalTagResource
            onTag={() => setIsTaggingOpenPosition(true)}
            resourceType={OPENPOSITION}
          />
        )}
      </PostForm>
    </>
  );
}

function SelectOpenPosition({
  setTaggedOpenPosition,
  taggedOpenPosition,
  setIsQuickCreatingOpenPos,
  isQuickCreatingOpenPos,
  openPosSuccessfullyCreated,
  openPosFormatErrors,
  quickOpenPosition,
  setQuickOpenPosition,
  selectedGroup,
  setSelectedGroup,
  postSubmissionError,
  cancelTagging,
}) {
  const [displayedOpenPositions, setDisplayedOpenPositions] = useState([]);
  const {userProfile} = useContext(AuthContext);

  if (taggedOpenPosition) {
    return (
      <div className="tagged-resource-section">
        <ReducedOpenPositionListItem
          openPosition={taggedOpenPosition}
          noLink={true}
        />
        <div className="create-post-deselect-resource-container">
          <NegativeButton
            onClick={() => {
              setTaggedOpenPosition(undefined);
            }}
            smallVersion
          >
            Deselect
          </NegativeButton>
        </div>
        <button
          className="create-post-cancel-tagging-button"
          onClick={cancelTagging}
        >
          <h3>Cancel tag</h3>
        </button>
      </div>
    );
  }
  // The "search" button is just there to prevent search/url switch
  // if the user clicks enter
  let searchOrCreateDisplay = (
    <>
      <h4>Search Open Positions</h4>
      <div className="resource-search-input-container">
        <FormDatabaseSearch
          setDisplayedItems={setDisplayedOpenPositions}
          indexName="_OPENPOSITIONS"
          placeholderText=""
          displayedItems={displayedOpenPositions}
          clearListOnNoResults={true}
          hasCustomContainer={true}
          hideSearchIcon={true}
        />
      </div>
      {displayedOpenPositions && displayedOpenPositions.length > 0 && (
        <OpenPositionsSearchResults
          openPositions={displayedOpenPositions}
          setTaggedOpenPosition={setTaggedOpenPosition}
        />
      )}
    </>
  );
  if (isQuickCreatingOpenPos)
    searchOrCreateDisplay = (
      <QuickCreateOpenPosition
        openPosFormatErrors={openPosFormatErrors}
        userID={userProfile.id}
        quickOpenPosition={quickOpenPosition}
        setQuickOpenPosition={setQuickOpenPosition}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />
    );

  return (
    <div className="tagged-resource-section">
      <SwitchTagMethod
        setIsCreating={setIsQuickCreatingOpenPos}
        isCreating={isQuickCreatingOpenPos}
      />
      {searchOrCreateDisplay}
      <div className="create-pub-post-alert-container">
        {openPosSuccessfullyCreated && postSubmissionError && (
          <Alert variant="primary">
            Your open position was successfully created. Only the post failed.
            You should be able to find that open position by searching.
          </Alert>
        )}
      </div>
    </div>
  );
}

function OpenPositionsSearchResults({openPositions, setTaggedOpenPosition}) {
  const selectOpenPosition = (openPosition) => {
    setTaggedOpenPosition(openPosition);
  };
  return openPositions.map((openPosition) => {
    if (!openPosition.objectID) return null;
    openPosition.id = openPosition.objectID;
    return (
      <div
        key={openPosition.id}
        className="resource-result-with-selector-container"
      >
        <div className="resource-result-selector-container">
          <SecondaryButton
            className="resource-result-selector"
            onClick={() => selectOpenPosition(openPosition)}
          >
            <div className="select-tagged-resource-icon">
              <TagResourceIcon />
            </div>
            Select
          </SecondaryButton>
        </div>
        <ReducedOpenPositionListItem
          noLink={true}
          openPosition={openPosition}
          decreasedEmphasis={true}
        />
      </div>
    );
  });
}

export function QuickCreateOpenPosition({
  userID,
  openPosFormatErrors,
  quickOpenPosition,
  setQuickOpenPosition,
  selectedGroup,
  setSelectedGroup,
}) {
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [loadingMemberOfGroups, setLoadingMemberOfGroups] = useState(true);
  useEffect(async () => {
    if (!loadingMemberOfGroups) setLoadingMemberOfGroups(true);
    const groupsQS = await db
      .collection(`users/${userID}/groups`)
      .get()
      .catch((err) => console.error(err));
    if (!groupsQS || groupsQS.empty) {
      setLoadingMemberOfGroups(false);
      return;
    }
    const groups = [];
    groupsQS.forEach((ds) => {
      const groupData = ds.data();
      groupData.id = ds.id;
      groups.push(groupData);
    });
    setMemberOfGroups(groups);
    setLoadingMemberOfGroups(false);
  }, [userID]);

  if (loadingMemberOfGroups) return <LoadingSpinner />;
  if (!selectedGroup)
    return (
      <>
        <h4 className="quick-create-open-position-group-note">
          Which group is this for?
        </h4>
        <SelectGroup
          groups={memberOfGroups}
          setSelectedGroup={setSelectedGroup}
          toggleText="Select from your groups"
          loadingMemberOfGroups={loadingMemberOfGroups}
        />
      </>
    );
  return (
    <div>
      <SelectedGroup
        groups={memberOfGroups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />
      <TextInput
        error={handleOpenPosTitleError(openPosFormatErrors)}
        name="title"
        label="Title"
        value={quickOpenPosition.url}
        onChange={(e) =>
          setQuickOpenPosition((existingOpenPos) => {
            return {...existingOpenPos, title: e.target.value};
          })
        }
      />
      <h4 style={{marginTop: '40px'}}>Position</h4>
      <SelectPosition
        toggleText={
          quickOpenPosition.position ? quickOpenPosition.position : 'Select'
        }
        nonForm={true}
        onSelect={(selection) =>
          setQuickOpenPosition((existingOpenPos) => {
            return {...existingOpenPos, position: selection};
          })
        }
      />
      {handleOpenPosPositionError(openPosFormatErrors)}
      <h4 style={{marginTop: '40px'}}>How to Apply</h4>
      <HowToApply
        nonForm={true}
        nonFormAction={(e) => {
          if (e.target.name === 'applyLink')
            setQuickOpenPosition((existingOpenPos) => {
              return {
                ...existingOpenPos,
                applyLink: e.target.value,
                applyEmail: '',
              };
            });
          if (e.target.name === 'applyEmail')
            setQuickOpenPosition((existingOpenPos) => {
              return {
                ...existingOpenPos,
                applyEmail: e.target.value,
                applyLink: '',
              };
            });
        }}
      />
      {handleApplyError(openPosFormatErrors)}
    </div>
  );
}

async function validateQuickOpenPosition(quickOpenPosition) {
  const quickOpenPosValidationSchema = Yup.object({
    title: Yup.string()
      .required('You need to provide a title.')
      .max(
        100,
        'The title is too long. It must be no longer than 100 characters.'
      ),

    description: yupRichBodyOnlyValidation(MAX_ARTICLE_CHARACTERS, 40),
    applyEmail: Yup.string()
      .test(
        'one-apply-method',
        'You need to provide a link or email for applications',
        function (value) {
          // eslint-disable-next-line no-invalid-this
          if (this.parent.applyLink || value) return true;
        }
      )
      .email('Must be a valid email address')
      .max(100, 'Too long. It must be no longer than 100 characters.'),
    applyLink: Yup.string()
      .test(
        'one-apply-method',
        'You need to provide a link or email for applications',
        function (value) {
          // eslint-disable-next-line no-invalid-this
          if (this.parent.applyEmail || value) return true;
        }
      )
      .url('Must be a valid url')
      .max(200, 'Too long. It must be no longer than 200 characters.'),
    position: Yup.mixed().oneOf(POSITIONS),
  });
  return quickOpenPosValidationSchema
    .validate(quickOpenPosition, {abortEarly: false})
    .then(() => {
      return [];
    })
    .catch((err) => {
      return err.errors;
    });
}

function handleOpenPosTitleError(quickOpenPosErrors) {
  if (!quickOpenPosErrors || quickOpenPosErrors.length === 0) return null;
  if (quickOpenPosErrors.some((error) => error.includes('title')))
    return <InputError error={quickOpenPosErrors[0]} />;
}

function handleOpenPosPositionError(quickOpenPosErrors) {
  if (!quickOpenPosErrors || quickOpenPosErrors.length === 0) return null;
  if (quickOpenPosErrors.some((error) => error.includes('position')))
    return (
      <InputError noMargin={true} error="You need to provide a position" />
    );
  return null;
}

function handleApplyError(quickOpenPosErrors) {
  if (!quickOpenPosErrors || quickOpenPosErrors.length === 0) return null;
  if (
    quickOpenPosErrors.some((error) => error.includes('link')) ||
    quickOpenPosErrors.some((error) => error.includes('email'))
  )
    return (
      <InputError noMargin={true} error={'You need to add an email or link'} />
    );
  return null;
}

async function submitOpenPosPost(
  res,
  isTweeting,
  setPostSuccess,
  selectedTopics,
  setSubmittingPost,
  openPosSubmissionError,
  setOpenPosSubmissionError,
  quickOpenPosition,
  setQuickOpenPosition,
  openPosSuccessfullyCreated,
  setOpenPosSuccessfullyCreated,
  isQuickCreatingOpenPos,
  setIsQuickCreatingOpenPos,
  openPosFormatErrors,
  setOpenPosFormatErrors,
  selectedGroup,
  postSubmissionError,
  setPostSubmissionError,
  taggedOpenPosition,
  isTaggingOpenPosition,
  setPostCreateDataResp
) {
  setSubmittingPost(true);
  if (openPosFormatErrors) setOpenPosFormatErrors([]);
  if (openPosSubmissionError) setPubSubmissionError(false);
  if (openPosSuccessfullyCreated) setOpenPosSuccessfullyCreated(null);
  if (postSubmissionError) setPostSubmissionError(false);
  const submitQuickOpenPos = async () => {
    if (!isQuickCreatingOpenPos || !isTaggingOpenPosition) return false;
    const openPositionToBeCreated = {...quickOpenPosition};
    openPositionToBeCreated.description = res.title;
    const openPosValidationErrors = await validateQuickOpenPosition(
      openPositionToBeCreated
    );
    if (openPosValidationErrors.length > 0) {
      setOpenPosFormatErrors(openPosValidationErrors);
      setSubmittingPost(false);
      return false;
    }
    openPositionToBeCreated.group = convertGroupToGroupRef(selectedGroup);
    openPositionToBeCreated.topics = selectedTopics;
    return createOpenPosition(openPositionToBeCreated)
      .then((openPositionID) => {
        const newOpenPosID = openPositionID.data.id;
        setOpenPosSuccessfullyCreated(true);
        return newOpenPosID;
      })
      .catch((err) => {
        console.error(`unable to create open position ${err}`);
        setOpenPosSubmissionError(true);
        return false;
      });
  };
  const openPositionCreationID = await submitQuickOpenPos();
  if (isQuickCreatingOpenPos && !openPositionCreationID) {
    setSubmittingPost(false);
    return;
  }

  res.postType = {id: 'openPositionPost', name: 'Open Position'};
  res.topics = selectedTopics;
  if (isTaggingOpenPosition) {
    if (isQuickCreatingOpenPos) {
      const formattedOpenPosition = {
        topics: selectedTopics,
        group: selectedGroup,
        content: {...quickOpenPosition, description: res.title},
        id: openPositionCreationID,
      };
      console.log(formattedOpenPosition);
      res.openPosition = formattedOpenPosition;
    } else if (taggedOpenPosition) {
      const dbOpenPosition = algoliaOpenPosToDBOpenPosListItem(
        taggedOpenPosition
      );
      dbOpenPosition.id = taggedOpenPosition.id;
      res.openPosition = dbOpenPosition;
    }
  }
  if (!res.openPosition) {
    const openPositionInPost = await checkRichTextForOpenPosLinkAndFetch(
      res.title
    );
    if (openPositionInPost) res.openPosition = openPositionInPost;
  }
  createPost(res)
    .then((response) => {
      if (isTweeting) openTwitterWithPopulatedTweet(res.title, selectedTopics);
      if (setPostCreateDataResp) setPostCreateDataResp(response.data);
      setSubmittingPost(false);
      setPostSuccess(true);
    })
    .catch((err) => {
      sortThrownCreatePostErrors(err);
      setPostSubmissionError(true);
      setQuickOpenPosition({});
      setIsQuickCreatingOpenPos(false);
      setSubmittingPost(false);
    });
}

export async function checkRichTextForOpenPosLinkAndFetch(postTitle) {
  const postPlainText = getTweetTextFromRichText(postTitle);
  const openPositionSearchRegex =
    env === 'local'
      ? /localhost:3000\/openPosition\/[a-z,A-Z,0-9]*/g
      : /www.labspoon.com\/openPosition\/[a-z,A-Z,0-9]*/g;
  const matchedOpenPosURL = openPositionSearchRegex.exec(postPlainText);
  if (!matchedOpenPosURL) return null;
  const openPosIDFromText = matchedOpenPosURL[0].split('/')[2];
  const openPositionDS = await db
    .doc(`openPositions/${openPosIDFromText}`)
    .get()
    .catch((err) => console.error(err));
  if (!openPositionDS || !openPositionDS.exists) return;
  return openPosToOpenPosListItem(openPositionDS.data(), openPositionDS.id);
}
