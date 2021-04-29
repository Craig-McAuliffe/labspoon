import React, {useContext, useEffect, useState} from 'react';
import firebase, {db} from '../../../../firebase';
import {CreatePostTextArea, TextInput} from '../../../Forms/FormTextInput';
import PostForm from './PostForm';
import TypeOfTaggedResourceDropDown from './TypeOfTaggedResourceDropDown';
import {
  CreatingPostContext,
  sortThrownCreatePostErrors,
  openTwitterWithPopulatedTweet,
  SwitchTagMethod,
} from './CreatePost';

import './CreatePost.css';
import {ReducedOpenPositionListItem} from '../../../OpenPosition/OpenPositionListItem';
import NegativeButton from '../../../Buttons/NegativeButton';
import FormDatabaseSearch from '../../../Forms/FormDatabaseSearch';
import InputError from '../../../Forms/InputError';
import SecondaryButton from '../../../Buttons/SecondaryButton';
import {TagResourceIcon} from '../../../../assets/ResourceTypeIcons';
import {algoliaOpenPosToDBOpenPosListItem} from '../../../../helpers/openPositions';
import {
  MustSelectGroup,
  SelectedGroup,
  SelectGroupLabel,
} from '../../../Forms/Groups/SelectGroup';
import {
  SelectPosition,
  HowToApply,
} from '../../../OpenPosition/CreateOpenPosition';
import {AuthContext} from '../../../../App';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import {convertGroupToGroupRef} from '../../../../helpers/groups';
import {Alert} from 'react-bootstrap';
import {MAX_ARTICLE_CHARACTERS} from '../../../Article/Article';
import {initialValueNoTitle} from '../../../Forms/Articles/HeaderAndBodyArticleInput';
import SelectGroup from '../../../Group/SelectGroup';

const createPost = firebase.functions().httpsCallable('posts-createPost');
const createOpenPosition = firebase
  .functions()
  .httpsCallable('openPositions-createOpenPosition');

export default function OpenPositionPostForm({postType, setPostType}) {
  const {
    selectedTopics,
    setPostSuccess,
    setSubmittingPost,
    savedTitleText,
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

  useEffect(() => {
    if (!generalError) return;
    alert(
      'Something went wrong while creating your post. Sorry about that. Please try again and contact support if the problem persists.'
    );
    setGeneralError(false);
  }, [generalError]);

  const initialValues = {
    title: savedTitleText ? savedTitleText : '',
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
      selectedGroup
    );

  return (
    <PostForm
      onSubmit={submitChanges}
      initialValues={initialValues}
      formID="create-openPosition-post-form"
      algoliaFormSearch={
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
        />
      }
    >
      <div className="creating-post-main-text-container">
        <CreatePostTextArea name="title" />
      </div>
      <TypeOfTaggedResourceDropDown
        setTaggedResourceType={setPostType}
        taggedResourceType={postType}
      />
    </PostForm>
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
      </div>
    );
  }
  // The "search" button is just there to prevent search/url switch
  // if the user clicks enter
  let searchOrCreateDisplay = (
    <>
      <div className="tagged-resource-section">
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
      <div className="tagged-resource-section">
        <h4>Create Open Positions</h4>
        <QuickCreateOpenPosition
          openPosFormatErrors={openPosFormatErrors}
          userID={userProfile.id}
          quickOpenPosition={quickOpenPosition}
          setQuickOpenPosition={setQuickOpenPosition}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
      </div>
    );

  return (
    <>
      {searchOrCreateDisplay}
      <SwitchTagMethod
        setIsCreating={setIsQuickCreatingOpenPos}
        isCreating={isQuickCreatingOpenPos}
      />
      <div className="create-pub-post-alert-container">
        {openPosSuccessfullyCreated && (
          <Alert variant="primary">
            Your open position was successfully created. Only the post failed.
            You should be able to find that open position by searching.
          </Alert>
        )}
      </div>
    </>
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
        <SelectGroupLabel fieldName="Group">
          <SelectGroup
            groups={memberOfGroups}
            setSelectedGroup={setSelectedGroup}
            toggleText="Select from your groups"
            loadingMemberOfGroups={loadingMemberOfGroups}
          />
        </SelectGroupLabel>
        <MustSelectGroup
          userHasGroups={memberOfGroups.length > 0}
          explanation="Open positions can only be created for groups."
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
      {handleOpenPosPositionError(openPosFormatErrors)}
      <SelectPosition
        nonForm={true}
        onSelect={(selection) =>
          setQuickOpenPosition((existingOpenPos) => {
            return {...existingOpenPos, position: selection};
          })
        }
      />
      {handleOpenPosDescriptionError(openPosFormatErrors)}
      <h4>How to Apply</h4>
      {handleApplyError(openPosFormatErrors)}
      <HowToApply
        nonForm={true}
        nonFormAction={(e) => {
          if (e.target.value === 'applyLink')
            setQuickOpenPosition((existingOpenPos) => {
              return {
                ...existingOpenPos,
                applyLink: e.target.value,
                applyEmail: '',
              };
            });
          if (e.target.value === 'applyEmail')
            setQuickOpenPosition((existingOpenPos) => {
              return {
                ...existingOpenPos,
                applyEmail: e.target.value,
                applyLink: '',
              };
            });
        }}
      />
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
  if (!quickOpenPosErrors.some((error) => error.includes('position')))
    return null;
  const indexOfError = quickOpenPosErrors.indexOf((error) => {
    error.includes('position');
  });
  return <InputError error={quickOpenPosErrors[indexOfError]} />;
}

function handleOpenPosDescriptionError(quickOpenPosErrors) {
  if (!quickOpenPosErrors || quickOpenPosErrors.length === 0) return null;
  if (!quickOpenPosErrors.some((error) => error.includes('description')))
    return null;
  const indexOfError = quickOpenPosErrors.indexOf((error) => {
    error.includes('description');
  });
  return <InputError error={quickOpenPosErrors[indexOfError]} />;
}

function handleApplyError(quickOpenPosErrors) {
  if (!quickOpenPosErrors || quickOpenPosErrors.length === 0) return null;
  if (
    !(
      quickOpenPosErrors.length === 1 &&
      (quickOpenPosErrors[0].includes('applyLink') ||
        quickOpenPosErrors[0].includes('applyEmail'))
    )
  )
    return null;
  return <InputError error={'You need to add an email or link'} />;
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
  selectedGroup
) {
  setSubmittingPost(true);
  if (openPosFormatErrors) setOpenPosFormatErrors([]);
  if (openPosSubmissionError) setPubSubmissionError(false);
  if (openPosSuccessfullyCreated) setOpenPosSuccessfullyCreated(null);
  const submitQuickOpenPos = async () => {
    if (!isQuickCreatingOpenPos) return false;
    const openPosValidationErrors = await validateQuickOpenPosition(
      quickOpenPosition
    );
    if (openPosValidationErrors.length > 0) {
      setOpenPosFormatErrors(openPosValidationErrors);
      setSubmittingPost(false);
      return false;
    }
    const newOpenPosition = {...quickOpenPosition};
    newOpenPosition.group = convertGroupToGroupRef(selectedGroup);
    newOpenPosition.topics = selectedTopics;
    return createOpenPosition(newOpenPosition)
      .then(() => {
        setOpenPosSuccessfullyCreated(true);
        return true;
      })
      .catch((err) => {
        console.error(`unable to create open position ${err}`);
        setOpenPosSubmissionError(true);
        return false;
      });
  };
  if (isQuickCreatingOpenPos && !submitQuickOpenPos) {
    setSubmittingPost(false);
    return;
  }

  res.postType = {id: 'openPositionPost', name: 'Open Position'};
  res.topics = selectedTopics;
  if (isQuickCreatingOpenPos) {
    const newOpenPosition = {...quickOpenPosition};
    newOpenPosition.group = convertGroupToGroupRef(selectedGroup);
    newOpenPosition.topics = selectedTopics;
    res.openPosition = newOpenPosition;
  } else {
    if (taggedOpenPosition) {
      const dbOpenPosition = algoliaOpenPosToDBOpenPosListItem(
        taggedOpenPosition
      );
      dbOpenPosition.id = taggedOpenPosition.id;
      res.openPosition = dbOpenPosition;
    }
  }
  createPost(res)
    .then(() => {
      if (isTweeting) openTwitterWithPopulatedTweet(res.title, selectedTopics);
      setSubmittingPost(false);
      setPostSuccess(true);
    })
    .catch((err) => {
      sortThrownCreatePostErrors(err);
      setQuickOpenPosition({});
      setIsQuickCreatingOpenPos(false);
      setSubmittingPost(false);
    });
}
