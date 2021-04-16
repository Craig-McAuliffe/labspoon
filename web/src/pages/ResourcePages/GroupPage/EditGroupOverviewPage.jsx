import React, {useEffect, useState, useReducer} from 'react';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import TertiaryButton from '../../../components/Buttons/TertiaryButton';
import {ImagesSection} from '../../../components/Images/ImageListItem';
import Results, {GenericListItem} from '../../../components/Results/Results';
import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {GROUPS, PHOTO, POST} from '../../../helpers/resourceTypeDefinitions';
import {db} from '../../../firebase';

import './EditGroupOverviewPage.css';
import {
  PaddedContent,
  UnpaddedPageContainer,
} from '../../../components/Layout/Content';
import {SaveOrCancelPopover} from '../../../components/Popovers/Popover';
import {Link} from 'react-router-dom';
import {Alert} from 'react-bootstrap';
import ErrorMessage from '../../../components/Forms/ErrorMessage';
import SuccessMessage from '../../../components/Forms/SuccessMessage';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const PHOTO_LIMIT = 6;
const GROUP_NEWS_LIMIT = 15;
const PAGE_DISPLAY_TOGGLE = 'isDisplayingOverviewPage';
const MEMBER_REEL_TOGGLE = 'isDisplayingMemberReel';
const TOP_TOPICS_TOGGLE = 'isDisplayingTopTopics';
const PHOTO_HIGHLIGHTS_LIMIT = 6;

const photoHighlightReducerInitialState = {
  photoHighlights: [],
  selectedPhotoHighlights: [],
  deselectedPhotoHighlights: [],
  newPhotoHighlights: [],
};
// TO DO enforce only 6 highlighted photos
export default function EditGroupOverviewPage({groupData, groupID, children}) {
  const [submitting, setSubmitting] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [successfulSubmit, setSuccessfulSubmit] = useState(false);

  const [photoHighlightState, dispatchPhotoHighlight] = useReducer(
    photoHighlightReducer,
    photoHighlightReducerInitialState
  );

  const initialToggleOptions = {
    [PAGE_DISPLAY_TOGGLE]: groupData.isDisplayingOverviewPage ? true : false,
    [MEMBER_REEL_TOGGLE]: groupData.isDisplayingMemberReel ? true : false,
    [TOP_TOPICS_TOGGLE]: groupData.isDisplayingTopTopics ? true : false,
  };
  const [toggleOptions, setToggleOptions] = useState(initialToggleOptions);

  useEffect(() => {
    if (!successfulSubmit) return;
    setTimeout(() => setSuccessfulSubmit(false), 4000);
  }, [successfulSubmit]);

  const resetDisplayOptions = () => {
    setToggleOptions(initialToggleOptions);
    dispatchPhotoHighlight({type: 'reset'});
  };

  const refreshPageData = () => {
    if (
      photoHighlightState.selectedPhotoHighlights.length > 0 ||
      photoHighlightState.deselectedPhotoHighlights.length > 0
    ) {
      dispatchPhotoHighlight({type: 'submittedPhotoHighlights'});
    }
    if (JSON.stringify(toggleOptions) != JSON.stringify(initialToggleOptions)) {
      groupData.isDisplayingOverviewPage = toggleOptions[PAGE_DISPLAY_TOGGLE];
      groupData.isDisplayingMemberReel = toggleOptions[MEMBER_REEL_TOGGLE];
      groupData.isDisplayingTopTopics = toggleOptions[TOP_TOPICS_TOGGLE];
    }
  };

  // if changes have been made, display popup to submit or cancel
  useEffect(() => {
    if (!toggleOptions) return;
    if (
      JSON.stringify(toggleOptions) != JSON.stringify(initialToggleOptions) ||
      photoHighlightState.selectedPhotoHighlights.length > 0 ||
      photoHighlightState.deselectedPhotoHighlights.length > 0
    )
      return setChangesMade(true);
    setChangesMade(false);
  }, [
    toggleOptions,
    photoHighlightState.selectedPhotoHighlights,
    photoHighlightState.deselectedPhotoHighlights,
    initialToggleOptions,
  ]);
  // TO DO - SUBMIT news feed items
  const submitChanges = async () => {
    setSubmitting(true);
    if (submitError) setSubmitError(false);
    if (successfulSubmit) setSuccessfulSubmit(false);
    if (
      JSON.stringify(toggleOptions) == JSON.stringify(initialToggleOptions) &&
      photoHighlightState.selectedPhotoHighlights.length === 0 &&
      photoHighlightState.deselectedPhotoHighlights.length === 0
    )
      return;
    const batch = db.batch();
    if (photoHighlightState.selectedPhotoHighlights.length > 0) {
      photoHighlightState.selectedPhotoHighlights.forEach((selectedPhoto) => {
        batch.set(
          db.doc(`groups/${groupID}/photoHighlights/${selectedPhoto.id}`),
          selectedPhoto
        );
      });
    }
    if (photoHighlightState.deselectedPhotoHighlights.length > 0) {
      photoHighlightState.deselectedPhotoHighlights.forEach(
        (deselectedPhoto) => {
          batch.delete(
            db.doc(`groups/${groupID}/photoHighlights/${deselectedPhoto.id}`)
          );
        }
      );
    }
    if (JSON.stringify(toggleOptions) != JSON.stringify(initialToggleOptions)) {
      batch.update(db.doc(`groups/${groupID}`), toggleOptions);
    }
    const successOrFailure = await batch
      .commit()
      .then(() => {
        setSuccessfulSubmit(true);
        return true;
      })
      .catch((err) => {
        console.error('unable to commit group overview page changes ' + err);
        setSubmitError(true);
        return false;
      });
    if (successOrFailure) refreshPageData();
    setSubmitting(false);
  };
  const checkNumberHighlightedPhotosThenAdd = (srcAndID) => {
    if (
      photoHighlightState.newPhotoHighlights.length >= PHOTO_HIGHLIGHTS_LIMIT
    ) {
      return;
    }
    dispatchPhotoHighlight({type: 'select', photoData: srcAndID});
  };

  return (
    <UnpaddedPageContainer>
      <PaddedContent>
        {children}
        <h2 className="edit-group-overview-page-title">
          Overview Page Display Options
        </h2>
        {submitError && (
          <div className="edit-group-overview-page-success-error-container">
            <ErrorMessage>
              Something went wrong while saving those changes. Please try again.
            </ErrorMessage>
          </div>
        )}
        {successfulSubmit && (
          <div className="edit-group-overview-page-success-error-container">
            <SuccessMessage>
              Your chosen options were successfully saved
            </SuccessMessage>
          </div>
        )}
        <EditOverviewPageTogglesSection
          toggleOptions={toggleOptions}
          setToggleOptions={setToggleOptions}
          groupID={groupID}
        />
        <EditOverviewPagePhotosSection
          dispatchPhotoHighlight={dispatchPhotoHighlight}
          newPhotoHighlights={photoHighlightState.newPhotoHighlights}
          deselectPhotoAction={(srcAndID) =>
            dispatchPhotoHighlight({type: 'deselect', photoData: srcAndID})
          }
          selectPhotoAction={(srcAndID) =>
            checkNumberHighlightedPhotosThenAdd(srcAndID)
          }
          submitting={submitting}
          groupID={groupID}
        />
      </PaddedContent>
      <EditOverviewPageNewsSection groupID={groupID} />
      {changesMade && (
        <SaveOrCancelPopover
          submitting={submitting}
          onCancel={resetDisplayOptions}
          onSave={submitChanges}
        />
      )}
    </UnpaddedPageContainer>
  );
}

function EditOverviewPageTogglesSection({
  toggleOptions,
  setToggleOptions,
  groupID,
}) {
  const changeToggleState = (toggleName) =>
    setToggleOptions((currentToggleOptions) => {
      const newToggleOptions = {...currentToggleOptions};
      newToggleOptions[toggleName] = !currentToggleOptions[toggleName];
      return newToggleOptions;
    });

  return (
    <div className="edit-group-overview-page-toggles-section">
      <div>
        <h3 className="edit-group-overview-page-sub-title">Page Display</h3>
        <p className="edit-group-overview-page-toggle-description">
          Show or hide the overview page.
        </p>
      </div>
      <SecondaryButton onClick={() => changeToggleState(PAGE_DISPLAY_TOGGLE)}>
        {toggleOptions[PAGE_DISPLAY_TOGGLE] ? 'Hide' : 'Display'}
      </SecondaryButton>
      <div>
        <h3 className="edit-group-overview-page-sub-title">Member Reel</h3>
        <p className="edit-group-overview-page-toggle-description">
          Show or hide the member reel. You can edit the bio for each member
          through the{' '}
          <Link to={`/group/${groupID}/edit/members`}>Members tab</Link>.
        </p>
      </div>
      <SecondaryButton onClick={() => changeToggleState(MEMBER_REEL_TOGGLE)}>
        {toggleOptions[MEMBER_REEL_TOGGLE] ? 'Hide' : 'Display'}
      </SecondaryButton>
      <div>
        <h3 className="edit-group-overview-page-sub-title">Top topics</h3>
        <p className="edit-group-overview-page-toggle-description">
          Show or hide the topics that your group writes about. These topics are
          automatically generated through your group&#39;s activity.
        </p>
      </div>
      <SecondaryButton onClick={() => changeToggleState(TOP_TOPICS_TOGGLE)}>
        {toggleOptions[TOP_TOPICS_TOGGLE] ? 'Hide' : 'Display'}
      </SecondaryButton>
    </div>
  );
}
function EditOverviewPageNewsSection({groupID}) {
  const [loadingGroupNews, setLoadingGroupNews] = useState(true);
  const [hasMoreGroupNews, setHasMoreGroupNews] = useState(false);
  const [groupNews, setGroupNews] = useState([]);
  const [lastNewsItem, setLastLastNewsItem] = useState(false);
  const [hasFetchingError, setHasFetchingError] = useState(false);
  const [hasNoNewsItems, setHasNoNewsItems] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);

  const fetchGroupNews = async () => {
    if (!setLoadingGroupNews) setLoadingGroupNews(true);
    const fetchedGroupNews = await getPaginatedResourcesFromCollectionRef(
      db.collection(`groups/${groupID}/news`),
      GROUP_NEWS_LIMIT + 1,
      lastNewsItem,
      POST
    ).catch((err) => {
      console.error('unable to fetch group news ' + err);
      setHasFetchingError(true);
    });
    if (!fetchedGroupNews) {
      setLoadingGroupNews(false);
      return;
    }
    setHasNoNewsItems(false);
    fetchedGroupNews.forEach((fetchedNewsItem) => {
      addListItemDropdownOptions(fetchedNewsItem);
    });
    if (fetchedGroupNews.length > GROUP_NEWS_LIMIT) {
      setGroupNews((currentNews) => [
        ...currentNews,
        ...fetchedGroupNews.slice(0, GROUP_NEWS_LIMIT),
      ]);
      setLastLastNewsItem(fetchedGroupNews[GROUP_NEWS_LIMIT - 1]);
      setHasMoreGroupNews(true);
    } else {
      setGroupNews((currentNews) => [...currentNews, ...fetchedGroupNews]);
      if (hasMoreGroupNews) setHasMoreGroupNews(false);
      setLastLastNewsItem(fetchedGroupNews[fetchedGroupNews.length - 1]);
      if (fetchedGroupNews.length === 0) setHasNoNewsItems(true);
    }
    setLoadingGroupNews(false);
  };

  const addListItemDropdownOptions = (post) => {
    post.showPinOption = true;
    post.showHighlightOption = true;
    post.pinProfileCollection = GROUPS;
    post.pinProfileID = groupID;
    post.showNews = true;
    post.newsCollection = `groups/${groupID}/news`;
  };
  useEffect(async () => fetchGroupNews(), []);

  // fetch recent posts if no current news items
  useEffect(async () => {
    if (!hasNoNewsItems) return;
    const fetchedRecentPosts = await getPaginatedResourcesFromCollectionRef(
      db.collection(`groups/${groupID}/posts`),
      GROUP_NEWS_LIMIT,
      undefined,
      POST
    ).catch((err) =>
      console.error('unable to fetch recent group posts ' + err)
    );
    if (!fetchedRecentPosts || fetchedRecentPosts.length === 0) return;
    fetchedRecentPosts.forEach((fetchedRecentPost) => {
      addListItemDropdownOptions(fetchedRecentPost);
    });
    setRecentPosts(fetchedRecentPosts);
  }, [hasNoNewsItems]);

  if (loadingGroupNews) return <LoadingSpinner />;
  if (hasFetchingError)
    return (
      <ErrorMessage noBorder={true}>
        Something went wrong while fetching your group news. Please refresh the
        page.
      </ErrorMessage>
    );
  return (
    <>
      <PaddedContent>
        <h3 className="edit-group-overview-page-sub-title">News</h3>
      </PaddedContent>
      <Results
        customLoading={loadingGroupNews}
        hasMore={hasMoreGroupNews}
        results={groupNews}
        customEndMessage={<p></p>}
        fetchMore={fetchGroupNews}
      />
      {hasNoNewsItems && (
        <>
          <NoHighlightsText />
          <RecentGroupPosts posts={recentPosts} groupID={groupID} />
        </>
      )}
    </>
  );
}
function photoHighlightReducer(state, action) {
  const photoData = action.photoData;
  const photoID =
    photoData && !Array.isArray(photoData) ? photoData.id : undefined;
  const {
    photoHighlights,
    selectedPhotoHighlights,
    deselectedPhotoHighlights,
    newPhotoHighlights,
  } = state;
  const isAlreadyHighlighted = photoHighlights.some(
    (photoHighlight) => photoHighlight.id === photoID
  );
  const newState = {...state};
  switch (action.type) {
    case 'submittedPhotoHighlights': {
      newState.photoHighlights = newPhotoHighlights;
      newState.selectedPhotoHighlights = [];
      newState.deselectedPhotoHighlights = [];
      break;
    }
    case 'reset': {
      newState.newPhotoHighlights = photoHighlights;
      newState.selectedPhotoHighlights = [];
      newState.deselectedPhotoHighlights = [];
      break;
    }
    case 'fetchedPhotoHighlights': {
      newState.photoHighlights = photoData;
      newState.newPhotoHighlights = photoData;
      break;
    }
    case 'select': {
      if (isAlreadyHighlighted) {
        const filteredDeselectedPhotoHighlights = deselectedPhotoHighlights.filter(
          (deselectedPhotoHighlight) => deselectedPhotoHighlight.id !== photoID
        );
        newState.deselectedPhotoHighlights = filteredDeselectedPhotoHighlights;
      } else
        newState.selectedPhotoHighlights = [
          ...selectedPhotoHighlights,
          photoData,
        ];
      newState.newPhotoHighlights = [...newPhotoHighlights, photoData];
      break;
    }
    case 'deselect': {
      if (isAlreadyHighlighted) {
        newState.deselectedPhotoHighlights = [
          ...deselectedPhotoHighlights,
          photoData,
        ];
      } else {
        const filteredSelectedPhotos = selectedPhotoHighlights.filter(
          (newlySelectedPhoto) => newlySelectedPhoto.id !== photoID
        );
        newState.selectedPhotoHighlights = filteredSelectedPhotos;
      }
      newState.newPhotoHighlights = newPhotoHighlights.filter(
        (newPhotoHighlight) => newPhotoHighlight.id !== photoID
      );
      break;
    }
    default:
      break;
  }
  return newState;
}

function EditOverviewPagePhotosSection({
  newPhotoHighlights,
  deselectPhotoAction,
  selectPhotoAction,
  submitting,
  groupID,
  dispatchPhotoHighlight,
}) {
  const [lastPhoto, setLastPhoto] = useState(false);
  const [groupPhotos, setGroupPhotos] = useState([]);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [hasPhotoFetchError, setHasPhotoFetchError] = useState(false);
  const [maxPhotoHighlightsReached, setMaxPhotoHighlightsReached] = useState(
    false
  );
  const [isLoadingMorePhotos, setIsLoadingMorePhotos] = useState(false);
  // check if max photo highlights is reached
  useEffect(() => {
    if (newPhotoHighlights.length >= PHOTO_HIGHLIGHTS_LIMIT)
      return setMaxPhotoHighlightsReached(true);
    if (maxPhotoHighlightsReached) return setMaxPhotoHighlightsReached(false);
  }, [newPhotoHighlights]);

  const fetchPhotos = async (isFetchMore) => {
    if (!loadingPhotos && !isFetchMore) setLoadingPhotos(true);
    if (!isLoadingMorePhotos && isFetchMore) setIsLoadingMorePhotos(true);
    if (!isFetchMore) {
      const fetchedPhotoHighlights = await getPaginatedResourcesFromCollectionRef(
        db.collection(`groups/${groupID}/photoHighlights`),
        PHOTO_HIGHLIGHTS_LIMIT,
        undefined,
        PHOTO
      ).catch((err) => {
        console.error('unable to fetch group photo highlights ' + err);
        setHasPhotoFetchError(true);
        setLoadingPhotos(false);
      });
      if (fetchedPhotoHighlights && fetchedPhotoHighlights.length > 0) {
        dispatchPhotoHighlight({
          type: 'fetchedPhotoHighlights',
          photoData: fetchedPhotoHighlights,
        });
      }
    }

    const fetchedGroupPhotos = await getPaginatedResourcesFromCollectionRef(
      db.collection(`groups/${groupID}/photos`),
      PHOTO_LIMIT + 1,
      lastPhoto,
      PHOTO
    ).catch((err) => {
      console.error('unable to fetch group photos ' + err);
      setHasPhotoFetchError(true);
      if (!isFetchMore) setLoadingPhotos(false);
      if (isFetchMore) setIsLoadingMorePhotos(false);
    });
    if (!fetchedGroupPhotos) return;
    if (fetchedGroupPhotos.length > PHOTO_LIMIT) {
      setGroupPhotos((currentPhotos) => [
        ...currentPhotos,
        ...fetchedGroupPhotos.slice(0, PHOTO_LIMIT),
      ]);
      setLastPhoto(fetchedGroupPhotos[PHOTO_LIMIT - 1]);
      setHasMorePhotos(true);
    } else {
      setGroupPhotos((currentPhotos) => [
        ...currentPhotos,
        ...fetchedGroupPhotos,
      ]);
      setLastPhoto(fetchedGroupPhotos[fetchedGroupPhotos.length - 1]);
      if (hasMorePhotos) setHasMorePhotos(false);
    }
    if (!isFetchMore) setLoadingPhotos(false);
    if (isFetchMore) setIsLoadingMorePhotos(false);
  };

  useEffect(async () => fetchPhotos(), []);

  let content = (
    <>
      <div className="edit-group-overview-page-photos-section">
        <h3 className="edit-group-overview-page-sub-sub-title">
          Selected highlights
        </h3>
        {newPhotoHighlights.length > 0 ? (
          <ImagesSection
            images={newPhotoHighlights}
            selectedIDs={newPhotoHighlights.map(
              (newPhotoHighlight) => newPhotoHighlight.id
            )}
            spinner={submitting}
            selectText="Add"
            selectAction={selectPhotoAction}
            deselectAction={deselectPhotoAction}
            deselectText="Remove"
          />
        ) : (
          <p>You haven&#39;t highlighted any photos yet!</p>
        )}
      </div>
      <div className="edit-group-overview-page-photos-section">
        <h3 className="edit-group-overview-page-sub-sub-title">
          Choose highlights from your group photos
        </h3>
        {groupPhotos.length > 0 ? (
          <>
            <ImagesSection
              images={groupPhotos}
              spinner={submitting}
              selectAction={selectPhotoAction}
              selectedIDs={newPhotoHighlights.map(
                (newPhotoHighlight) => newPhotoHighlight.id
              )}
              deselectAction={deselectPhotoAction}
              deselectText="Remove"
            />
            {isLoadingMorePhotos && <LoadingSpinner />}
          </>
        ) : (
          <div className="edit-group-overview-page-no-group-posts-alert-container">
            <Alert variant="warning">
              You need to upload photos to your group page before you can
              highlight them.{' '}
              <Link to={`/group/${groupID}/edit/photos`}>
                {' '}
                Upload photos here.
              </Link>
            </Alert>
          </div>
        )}
        {hasMorePhotos && (
          <div className="edit-group-overview-page-see-more-photos-container">
            <TertiaryButton onClick={() => fetchPhotos(true)}>
              See More
            </TertiaryButton>
          </div>
        )}
      </div>
    </>
  );
  if (loadingPhotos)
    content = (
      <ImagesSection
        images={[{src: 'loading'}, {src: 'loading'}, {src: 'loading'}]}
        loading={true}
      />
    );
  if (hasPhotoFetchError)
    content = (
      <ErrorMessage noBorder={true}>
        Something went wrong while fetching your group photos. Please refresh
        the page.
      </ErrorMessage>
    );
  return (
    <>
      <h3 className="edit-group-overview-page-sub-title">Photo Highlights</h3>
      {maxPhotoHighlightsReached && (
        <Alert variant="warning">
          You can only highlight 6 photos. If you would like to highlight a new
          photo, first remove one of your existing highlights.
        </Alert>
      )}
      {content}
    </>
  );
}
function RecentGroupPosts({posts, groupID}) {
  if (posts.length > 0)
    return posts.map((recentGroupPost) => (
      <GenericListItem result={recentGroupPost} key={recentGroupPost.id} />
    ));
  return (
    <div className="edit-group-overview-page-no-group-posts-alert-container">
      <Alert variant="warning">
        You need to add posts to your group page before you can put them on your
        news feed.{' '}
        <Link to={`/group/${groupID}/edit/posts`}>Add posts here.</Link>
      </Alert>
    </div>
  );
}

function NoHighlightsText() {
  return (
    <PaddedContent>
      <p className="edit-group-overview-page-no-group-news-text">
        You have not added any posts to your group news feed yet. You can do so
        by clicking on the dropdown menu at the top right of posts. Try adding
        some of your recent group posts below to your news feed.
      </p>
    </PaddedContent>
  );
}
