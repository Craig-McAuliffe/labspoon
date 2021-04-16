import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {EditIcon, NewsIcon, PinIcon} from '../../assets/GeneralActionIcons';
import {DottedBurgerMenuIcon} from '../../assets/MenuIcons';
import {db} from '../../firebase';
import {getPostListItemFromPost} from '../../helpers/posts';
import Dropdown, {DropdownOption} from '../Dropdown';
import SeeMore from '../SeeMore';

import './ListItemCommonComponents.css';

export function ListItemContainer({children, backgroundShade}) {
  return (
    <div
      className={`general-list-item-container-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      {children}
    </div>
  );
}

export function ExpandableText({
  backgroundShade,
  children,
  resourceID,
  initialHeight = 144,
}) {
  return (
    <SeeMore
      backgroundShade={backgroundShade}
      id={resourceID}
      initialHeight={initialHeight}
    >
      {children}
    </SeeMore>
  );
}
export const PIN = 'pin';
export const EDIT = 'edit';
export const NEWS = 'news';
export function ListItemOptionsDropdown({
  resourceType,
  resourceID,
  item,
  pinProfileID,
  pinProfileCollection,
  options,
  backgroundShade,
  showNews,
  newsCollection,
}) {
  const [isPinned, setIsPinned] = useState(false);
  const [submittingPin, setSubmittingPin] = useState(false);
  const [loadingPinState, setLoadingPinState] = useState(true);
  const [submittingNews, setSubmittingNews] = useState(false);
  const [loadingNewsState, setLoadingNewsState] = useState(false);
  const [isNews, setIsNews] = useState(false);
  if (!options || options.length === 0) return null;
  const listItemOptionsDropDownToggle = (setOpen, toggleRef) => (
    <button
      className={`list-item-dropdown-toggle-${
        backgroundShade ? backgroundShade : 'light'
      }`}
      onClick={() => setOpen((isOpen) => !isOpen)}
      ref={toggleRef}
    >
      <DottedBurgerMenuIcon />
    </button>
  );
  return (
    // <BrowserRouter basename="">
    <div
      className={`list-options-container-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      <Dropdown
        customToggle={listItemOptionsDropDownToggle}
        loadOnExpand={async () => {
          if (options.includes(PIN))
            await testIfItemIsPinned(
              setIsPinned,
              setLoadingPinState,
              item,
              pinProfileCollection,
              pinProfileID
            );

          if (options.includes(NEWS))
            await testIfItemIsOnNewsPage(
              setIsNews,
              setLoadingNewsState,
              item,
              newsCollection
            );
        }}
      >
        <ListItemOptionsDropDownOptions
          onSelect={() => {}}
          resourceType={resourceType}
          resourceID={resourceID}
          item={item}
          pinProfileID={pinProfileID}
          pinProfileCollection={pinProfileCollection}
          options={options}
          isPinned={isPinned}
          loadingPinState={loadingPinState}
          submittingPin={submittingPin}
          setSubmittingPin={setSubmittingPin}
          backgroundShade={backgroundShade}
          showNews={showNews}
          submittingNews={submittingNews}
          loadingNewsState={loadingNewsState}
          isNews={isNews}
          newsCollection={newsCollection}
          setSubmittingNews={setSubmittingNews}
        />
      </Dropdown>
    </div>
    // </BrowserRouter>
  );
}

function ListItemOptionsDropDownOptions({
  onSelect,
  resourceType,
  resourceID,
  item,
  pinProfileID,
  pinProfileCollection,
  options,
  isPinned,
  loadingPinState,
  submittingPin,
  setSubmittingPin,
  submittingNews,
  backgroundShade,
  showNews,
  loadingNewsState,
  isNews,
  newsCollection,
  setSubmittingNews,
}) {
  const history = useHistory();
  const optionsDisplayed = [];

  options.forEach((option) => {
    switch (option) {
      case PIN:
        if (item.showPinOption)
          optionsDisplayed.push(
            <DropdownOption
              loading={loadingPinState}
              backgroundShade={backgroundShade}
              onSelect={() => {
                if (loadingPinState || submittingPin) return;
                onSelect();
                pinItemToProfile(
                  setSubmittingPin,
                  item,
                  isPinned,
                  pinProfileID,
                  pinProfileCollection
                );
              }}
            >
              <h4
                className={`list-item-options-dropdown-text${
                  loadingPinState ? '-loading' : ''
                }-${backgroundShade ? backgroundShade : 'light'}`}
              >
                <PinIcon />
                {isPinned ? 'Unpin' : 'Pin'}
              </h4>
            </DropdownOption>
          );

        break;
      case NEWS: {
        if (showNews)
          optionsDisplayed.push(
            <DropdownOption
              loading={loadingNewsState}
              backgroundShade={backgroundShade}
              onSelect={() => {
                if (loadingNewsState || submittingNews) return;
                onSelect();
                addPostToNews(setSubmittingNews, item, isNews, newsCollection);
              }}
            >
              <h4
                className={`list-item-options-dropdown-text${
                  loadingPinState ? '-loading' : ''
                }-${backgroundShade ? backgroundShade : 'light'}`}
              >
                <NewsIcon />
                {isNews ? 'Remove' : 'Add News'}
              </h4>
            </DropdownOption>
          );
        break;
      }
      case EDIT:
        optionsDisplayed.push(
          <DropdownOption
            backgroundShade={backgroundShade}
            onSelect={() => {
              onSelect();
              history.replace(`/${resourceType}/${resourceID}/edit`, {
                previousLocation: history.location.pathname,
              });
            }}
          >
            <h4
              className={`list-item-options-dropdown-text-${
                backgroundShade ? backgroundShade : 'light'
              }`}
            >
              <EditIcon light={true} />
              Edit
            </h4>
          </DropdownOption>
        );
        break;
      default:
        return;
    }
  });
  return optionsDisplayed.map((option, i) => (
    <React.Fragment key={option + ' ' + i}> {option}</React.Fragment>
  ));
}

async function testIfItemIsPinned(
  setIsPinned,
  setLoadingPinState,
  item,
  pinProfileCollection,
  pinProfileID
) {
  setLoadingPinState(true);
  const profileDoc = await db
    .doc(`${pinProfileCollection}/${pinProfileID}`)
    .get()
    .catch((err) => console.error(err));
  const handleFetch = () => {
    if (!profileDoc) return setIsPinned(false);
    const profileData = profileDoc.data();
    if (!profileData) return setIsPinned(false);
    const currentPinnedItem = profileData.pinnedItem;
    if (!currentPinnedItem) return setIsPinned(false);
    if (item.id === currentPinnedItem.id) setIsPinned(true);
  };
  handleFetch();
  setLoadingPinState(false);
}

async function testIfItemIsOnNewsPage(
  setIsNews,
  setLoadingNewsState,
  item,
  newsCollection
) {
  setLoadingNewsState(true);
  const newsDoc = await db
    .doc(`${newsCollection}/${item.id}`)
    .get()
    .catch((err) => console.error(err));

  const handleFetch = () => {
    if (!newsDoc || !newsDoc.exists) return setIsNews(false);
    return setIsNews(true);
  };
  handleFetch();
  setLoadingNewsState(false);
}

async function addPostToNews(
  setSubmittingNews,
  item,
  isOnNewsPage,
  newsCollection
) {
  setSubmittingNews(true);
  const newsItemRef = db.doc(`${newsCollection}/${item.id}`);
  if (isOnNewsPage) {
    return newsItemRef
      .delete()
      .then(() => setSubmittingNews(false))
      .catch((err) => {
        console.error('unable to add item to news' + err);
        alert(
          'Something went wrong while removing that item from the news feed. Please try again.'
        );
        setSubmittingNews(false);
      });
  }

  const newsItem = {...item};
  delete newsItem.showPinOption;
  delete newsItem.pinProfileID;
  delete newsItem.pinProfileCollection;
  delete newsItem.backgroundShade;
  if (newsItem.showNews) {
    delete newsItem.showNews;
    delete newsItem.newsCollection;
  }
  return newsItemRef
    .set(getPostListItemFromPost(newsItem))
    .then(() => setSubmittingNews(false))
    .catch((err) => {
      console.error(err);
      alert(
        'Something went wrong while adding that item to the news feed. Please try again.'
      );
    });
}

async function pinItemToProfile(
  setSubmittingPin,
  item,
  isPinned,
  pinProfileID,
  pinProfileCollection
) {
  setSubmittingPin(true);
  if (isPinned) {
    return db
      .doc(`${pinProfileCollection}/${pinProfileID}`)
      .update({
        pinnedItem: null,
      })
      .then(() => {
        setSubmittingPin(false);
      })
      .catch((err) => {
        console.error('unable to add item to news' + err);
        alert(
          'Something went wrong while unpinning that item. Please try again.'
        );
        setSubmittingPin(false);
      });
  }
  const pinnedItem = {...item};
  delete pinnedItem.showPinOption;
  delete pinnedItem.pinProfileID;
  delete pinnedItem.pinProfileCollection;
  delete pinnedItem.backgroundShade;
  if (pinnedItem.showNews) {
    delete pinnedItem.showNews;
    delete pinnedItem.newsCollection;
  }
  return db
    .doc(`${pinProfileCollection}/${pinProfileID}`)
    .update({pinnedItem: pinnedItem})
    .then(() => {
      setSubmittingPin(false);
    })
    .catch((err) => {
      console.error(
        `unable to pin ${item.resourceType} to ${pinProfileCollection} with id ${pinProfileID} ${err}`
      );
      alert('Something went wrong while pinning that item. Please try again.');
      setSubmittingPin(false);
    });
}
