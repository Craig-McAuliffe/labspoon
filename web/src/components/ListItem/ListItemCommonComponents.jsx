import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {EditIcon, PinIcon} from '../../assets/GeneralActionIcons';
import {DottedBurgerMenuIcon} from '../../assets/MenuIcons';
import {db} from '../../firebase';
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
export function ListItemOptionsDropdown({
  resourceType,
  resourceID,
  item,
  pinProfileID,
  pinProfileCollection,
  options,
  backgroundShade,
}) {
  const [isPinned, setIsPinned] = useState(false);
  const [submittingPin, setSubmittingPin] = useState(false);
  const [loadingPinState, setLoadingPinState] = useState(true);

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
        loadOnExpand={() =>
          options.includes(PIN)
            ? testIfItemIsPinned(
                setIsPinned,
                setLoadingPinState,
                item,
                pinProfileCollection,
                pinProfileID
              )
            : null
        }
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
  backgroundShade,
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
                }`}
              >
                <PinIcon />
                {isPinned ? 'Unpin' : 'Pin'}
              </h4>
            </DropdownOption>
          );

        break;
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
            <h4 className="list-item-options-dropdown-text">
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
      .catch(() => {
        alert(
          'Something went wrong while pinning that item. Please try again.'
        );
        setSubmittingPin(false);
      });
  }
  const pinnedItem = {...item};
  delete pinnedItem.showPinOption;
  delete pinnedItem.pinProfileID;
  delete pinnedItem.pinProfileCollection;
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
