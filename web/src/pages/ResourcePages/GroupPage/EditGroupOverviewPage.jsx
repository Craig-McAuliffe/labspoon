import React, {useEffect, useState} from 'react';
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
import GeneralError from '../../../components/GeneralError';
import {Alert} from 'react-bootstrap';
import ErrorMessage from '../../../components/Forms/ErrorMessage';
import SuccessMessage from '../../../components/Forms/SuccessMessage';

const PHOTO_LIMIT = 6;
const GROUP_NEWS_LIMIT = 15;
const PAGE_DISPLAY_TOGGLE = 'pageDisplayToggle';
const MEMBER_REEL_TOGGLE = 'memberReelToggle';
const TOP_TOPICS_TOGGLE = 'topTopicsToggle';

// TO DO enforce only 6 highlighted photos
export default function EditGroupOverviewPage({groupData, groupID, children}) {
  const [lastPhoto, setLastPhoto] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingGroupNews, setLoadingGroupNews] = useState(true);
  const [hasMoreGroupNews, setHasMoreGroupNews] = useState(false);
  const [groupNews, setGroupNews] = useState([]);
  const [lastNewsItem, setLastLastNewsItem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoHighlights, setPhotoHighlights] = useState([]);
  const [changesMade, setChangesMade] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [deselectedPhotos, setDeselectedPhotos] = useState([]);
  const [hasFetchingError, setHasFetchingError] = useState(false);
  const [hasNoNewsItems, setHasNoNewsItems] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [submitError, setSubmitError] = useState(false);
  const [successfulSubmit, setSuccessfulSubmit] = useState(false);
  const [newPhotoHighlights, setNewPhotoHighlights] = useState([]);

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
    setSelectedPhotos([]);
    setDeselectedPhotos([]);
  };

  useEffect(() => {
    const photoHighlightsWithAddedAndRemoved = [];
    photoHighlights
      .filter(
        (photoHighlight) =>
          !deselectedPhotos.some(
            (deselectedPhoto) => deselectedPhoto.id === photoHighlight.id
          )
      )
      .forEach((stillHighlightedPhoto) =>
        photoHighlightsWithAddedAndRemoved.push(stillHighlightedPhoto)
      );
    selectedPhotos.forEach((justUploadedPhoto) =>
      photoHighlightsWithAddedAndRemoved.push(justUploadedPhoto)
    );
    setNewPhotoHighlights(photoHighlightsWithAddedAndRemoved);
  }, [selectedPhotos, deselectedPhotos, photoHighlights]);

  const refreshPageData = () => {
    if (selectedPhotos.length > 0 || deselectedPhotos.length > 0) {
      setPhotoHighlights(newPhotoHighlights);
      setSelectedPhotos([]);
      setDeselectedPhotos([]);
    }
    if (JSON.stringify(toggleOptions) != JSON.stringify(initialToggleOptions)) {
      groupData.isDisplayingOverviewPage = toggleOptions[PAGE_DISPLAY_TOGGLE];
      groupData.isDisplayingMemberReel = toggleOptions[MEMBER_REEL_TOGGLE];
      groupData.isDisplayingTopTopics = toggleOptions[TOP_TOPICS_TOGGLE];
    }
  };

  useEffect(() => {
    if (!toggleOptions) return;
    if (
      JSON.stringify(toggleOptions) != JSON.stringify(initialToggleOptions) ||
      selectedPhotos.length > 0 ||
      deselectedPhotos.length > 0
    )
      return setChangesMade(true);
    setChangesMade(false);
  }, [toggleOptions, selectedPhotos, deselectedPhotos, initialToggleOptions]);

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
    setRecentPosts(fetchedRecentPosts);
  }, [hasNoNewsItems]);

  const fetchPhotos = async () => {
    if (!loadingPhotos) setLoadingPhotos(true);
    const photoHighlights = await getPaginatedResourcesFromCollectionRef(
      db.collection(`groups/${groupID}/photoHighlights`),

      PHOTO_LIMIT + 1,
      lastPhoto,
      PHOTO
    ).catch((err) => {
      console.error('unable to fetch group photo highlights ' + err);
      setHasFetchingError(true);
      setLoadingGroupNews(false);
    });
    if (!photoHighlights) return;
    setPhotoHighlights(photoHighlights);

    const fetchedPhotos = await getPaginatedResourcesFromCollectionRef(
      db.collection(`groups/${groupID}/photos`),

      PHOTO_LIMIT + 1,
      lastPhoto,
      PHOTO
    ).catch((err) => {
      console.error('unable to fetch group photos ' + err);
      setHasFetchingError(true);
      setLoadingGroupNews(false);
    });
    if (!fetchedPhotos) return;
    photos.forEach((fetchedPhoto) => {
      fetchedPhoto.isOnOverviewPage = photoHighlights.some(
        (highlightedPhoto) => highlightedPhoto.id === fetchedPhoto.id
      );
    });
    if (fetchedPhotos.length > PHOTO_LIMIT) {
      setPhotos((currentPhotos) => [
        ...currentPhotos,
        ...fetchedPhotos.slice(0, PHOTO_LIMIT),
      ]);
      setLastPhoto(fetchedPhotos[PHOTO_LIMIT - 1]);
      setHasMorePhotos(true);
    } else {
      setPhotos((currentPhotos) => [...currentPhotos, ...fetchedPhotos]);
      setLastPhoto(fetchedPhotos[fetchedPhotos.length - 1]);
      if (hasMorePhotos) setHasMorePhotos(false);
    }
    setLoadingPhotos(false);
  };

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
      setLoadingGroupNews(false);
    });
    if (!fetchedGroupNews) return;
    fetchedGroupNews.forEach((fetchedNewsItem) => {
      fetchedNewsItem.showPinOption = true;
      fetchedNewsItem.showHighlightOption = true;
      fetchedNewsItem.pinProfileCollection = GROUPS;
      fetchedNewsItem.pinProfileID = groupID;
    });
    if (fetchedGroupNews.length > GROUP_NEWS_LIMIT) {
      setGroupNews((currentNews) => [
        ...currentNews,
        ...fetchedGroupNews.slice(0, GROUP_NEWS_LIMIT),
      ]);
      setLastLastNewsItem(fetchedGroupNews[GROUP_NEWS_LIMIT - 1]);
      setHasMoreGroupNews(true);
    } else {
      setPhotos((currentNews) => [...currentNews, ...fetchedGroupNews]);
      if (hasMoreGroupNews) setHasMoreGroupNews(false);
      setLastLastNewsItem(fetchedGroupNews[fetchedGroupNews.length - 1]);
      if (fetchGroupNews.length === 0) setHasNoNewsItems(true);
    }
    setLoadingGroupNews(false);
  };

  useEffect(async () => fetchPhotos(), []);

  useEffect(async () => fetchGroupNews(), []);

  const deselectImage = (srcAndID) => {
    const photoID = srcAndID.id;
    if (photoHighlights.some((photoHighlight) => photoHighlight.id === photoID))
      return setDeselectedPhotos((currentDeselectedPhotos) => [
        ...currentDeselectedPhotos,
        srcAndID,
      ]);
    const filteredSelectedPhotos = selectedPhotos.filter(
      (newlySelectedPhoto) => newlySelectedPhoto.id !== photoID
    );
    return setSelectedPhotos(filteredSelectedPhotos);
  };
  const changeToggleState = (toggleName) =>
    setToggleOptions((currentToggleOptions) => {
      const newToggleOptions = {...currentToggleOptions};
      newToggleOptions[toggleName] = !currentToggleOptions[toggleName];
      return newToggleOptions;
    });

  const submitChanges = () => {
    setSubmitting(true);
    if (submitError) setSubmitError(false);
    if (successfulSubmit) setSuccessfulSubmit(false);
    if (
      JSON.stringify(toggleOptions) == JSON.stringify(initialToggleOptions) &&
      selectedPhotos.length === 0 &&
      deselectedPhotos.length === 0
    )
      return;
    const batch = db.batch();
    if (selectedPhotos.length > 0) {
      selectedPhotos.forEach((selectedPhoto) => {
        batch.set(
          db.doc(`groups/${groupID}/photoHighlights/${selectedPhoto.id}`),
          selectedPhoto
        );
      });
      deselectedPhotos.forEach((deselectedPhoto) => {
        batch.delete(
          db.doc(`groups/${groupID}/photoHighlights/${deselectedPhoto.id}`)
        );
      });
    }
    if (JSON.stringify(toggleOptions) != JSON.stringify(initialToggleOptions)) {
      batch.update(db.doc(`groups/${groupID}`), toggleOptions);
    }
    const successOrFailure = batch
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
    if (!successOrFailure) return;
    if (successOrFailure) refreshPageData();
    setSubmitting(false);
  };
  if (hasFetchingError) return <GeneralError />;
  return (
    <UnpaddedPageContainer>
      <PaddedContent>
        {children}
        <h2 className="edit-group-overview-page-title">
          Overview Page Display Options
        </h2>
        {submitError && (
          <ErrorMessage noBorder={true}>
            Something went wrong while saving those changes. Please try again.
          </ErrorMessage>
        )}
        {successfulSubmit && (
          <SuccessMessage>
            Your chosen options were successfully saved
          </SuccessMessage>
        )}
        <div className="edit-group-overview-page-toggles-section">
          <div>
            <h3 className="edit-group-overview-page-sub-title">Page Display</h3>
            <p className="edit-group-overview-page-toggle-description">
              Show or hide the overview page.
            </p>
          </div>
          <SecondaryButton
            onClick={() => changeToggleState(PAGE_DISPLAY_TOGGLE)}
          >
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
          <SecondaryButton
            onClick={() => changeToggleState(MEMBER_REEL_TOGGLE)}
          >
            {toggleOptions[MEMBER_REEL_TOGGLE] ? 'Hide' : 'Display'}
          </SecondaryButton>
          <div>
            <h3 className="edit-group-overview-page-sub-title">Top topics</h3>
            <p className="edit-group-overview-page-toggle-description">
              Show or hide the topics that your group writes about. These topics
              are automatically generated through your group&#39;s activity.
            </p>
          </div>
          <SecondaryButton onClick={() => changeToggleState(TOP_TOPICS_TOGGLE)}>
            {toggleOptions[TOP_TOPICS_TOGGLE] ? 'Hide' : 'Display'}
          </SecondaryButton>
        </div>
        <h3 className="edit-group-overview-page-sub-title">Photo Highlights</h3>
        {photoHighlights.length > 0 && (
          <div className="edit-group-overview-page-photos-section">
            <h3 className="edit-group-overview-page-sub-sub-title">
              Current highlights
            </h3>
            <ImagesSection
              images={photoHighlights}
              selectedIDs={newPhotoHighlights.map(
                (newPhotoHighlight) => newPhotoHighlight.id
              )}
              spinner={submitting}
              selectText="Add"
              selectAction={(srcAndID) =>
                setDeselectedPhotos((currentDeselectedPhotos) => [
                  ...currentDeselectedPhotos,
                  srcAndID,
                ])
              }
              deselectAction={deselectAction}
              deselectText="Remove"
            />
          </div>
        )}
        <div className="edit-group-overview-page-photos-section">
          <h3 className="edit-group-overview-page-sub-sub-title">
            All group photos
          </h3>
          {photos.length > 0 ? (
            <ImagesSection
              images={photos}
              spinner={submitting}
              selectAction={(srcAndID) =>
                setSelectedPhotos((currentSelectedPhotos) => [
                  ...currentSelectedPhotos,
                  srcAndID,
                ])
              }
              selectedIDs={newPhotoHighlights.map(
                (newPhotoHighlight) => newPhotoHighlight.id
              )}
              deselectAction={deselectImage}
              deselectText="Remove"
            />
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
              <TertiaryButton onClick={() => fetchPhotos()}>
                See More
              </TertiaryButton>
            </div>
          )}
        </div>
        <h3 className="edit-group-overview-page-sub-title">News</h3>
      </PaddedContent>
      <Results
        customLoading={loadingGroupNews}
        hasMore={hasMoreGroupNews}
        results={groupNews}
        customEndMessage={<NoHighlightsText groupID={groupID} />}
      />
      {hasNoNewsItems && (
        <RecentGroupPosts posts={recentPosts} groupID={groupID} />
      )}
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

function NoHighlightsText({groupID}) {
  return (
    <PaddedContent>
      <p className="edit-group-overview-page-no-group-news-text">
        You have not added any posts to your group news feed yet. You can add{' '}
        <Link to={`/group/${groupID}/openPositions`}>posts</Link> to this feed
        by clicking on the burger menu in the top right of those posts on the
        group page or add recent group posts below.
      </p>
    </PaddedContent>
  );
}
