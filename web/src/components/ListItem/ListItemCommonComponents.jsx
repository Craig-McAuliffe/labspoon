import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {DottedBurgerMenuIcon} from '../../assets/MenuIcons';
import {db} from '../../firebase';
import PinButton from '../Buttons/PinButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import Dropdown, {DropdownOption} from '../Dropdown';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Popover, {StandardPopoverDisplay} from '../Popovers/Popover';
import SeeMore from '../SeeMore';

import './ListItemCommonComponents.css';

export function ListItemContainer({children}) {
  return <div className="general-list-item-container">{children}</div>;
}

export function ExpandableText({children, resourceID, initialHeight = 144}) {
  return (
    <SeeMore id={resourceID} initialHeight={initialHeight}>
      {children}
    </SeeMore>
  );
}

export function ListItemOptionsDropdown({resourceType, resourceID}) {
  const history = useHistory();
  const getListItemDropdownOptions = () => (
    <DropdownOption
      onSelect={() => {
        history.replace(`/${resourceType}/${resourceID}/edit`, {
          previousLocation: history.location.pathname,
        });
      }}
    >
      <h4 className="list-item-options-dropdown-text">Edit</h4>
    </DropdownOption>
  );

  const listItemOptionsDropDownToggle = (setOpen) => (
    <button
      className="list-item-dropdown-toggle"
      onClick={() => setOpen((isOpen) => !isOpen)}
    >
      <DottedBurgerMenuIcon />
    </button>
  );
  return (
    // <BrowserRouter basename="">
    <div className="list-options-container">
      <Dropdown customToggle={listItemOptionsDropDownToggle}>
        {getListItemDropdownOptions()}
      </Dropdown>
    </div>
    // </BrowserRouter>
  );
}

export function PinListItem({pinProfileID, pinProfileCollection, item}) {
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    testIfItemIsPinned();
  }, []);

  const testIfItemIsPinned = async () => {
    const profileDoc = await db
      .doc(`${pinProfileCollection}/${pinProfileID}`)
      .get()
      .catch((err) => console.error(err));
    if (!profileDoc) return setIsPinned(false);
    const profileData = profileDoc.data();
    if (!profileData) return setIsPinned(false);
    const currentPinnedItem = profileData.pinnedItem;
    if (!currentPinnedItem) return setIsPinned(false);
    if (item.id === currentPinnedItem.id) setIsPinned(true);
  };

  const pinItemToProfile = async (setOpen) => {
    setSubmitting(true);
    if (isPinned) {
      return db
        .doc(`${pinProfileCollection}/${pinProfileID}`)
        .update({
          pinnedItem: null,
        })
        .then(() => {
          setSubmitting(false);
          setOpen(false);
          testIfItemIsPinned();
        })
        .catch(() => {
          setOpen(false);
          alert(
            'Something went wrong while pinning that item. Please try again.'
          );
          setSubmitting(false);
        });
    }
    const pinnedItem = {...item};
    delete pinnedItem.hasPinOption;
    delete pinnedItem.pinProfileID;
    delete pinnedItem.pinProfileTypePlural;
    return db
      .doc(`${pinProfileCollection}/${pinProfileID}`)
      .update({pinnedItem: pinnedItem})
      .then(() => {
        setSubmitting(false);
        setOpen(false);
        testIfItemIsPinned();
      })
      .catch((err) => {
        console.error(
          `unable to pin ${item.resourceType} to ${pinProfileCollection} with id ${pinProfileID} ${err}`
        );
        setOpen(false);
        alert(
          'Something went wrong while pinning that item. Please try again.'
        );
        setSubmitting(false);
      });
  };

  const getPopUpComponent = (setOpen) => (
    <StandardPopoverDisplay
      noFixedWidth={true}
      right="20px"
      content={
        <PinPopOverContent
          isPinned={isPinned}
          submitting={submitting}
          pinItemToProfile={() => pinItemToProfile(setOpen)}
        />
      }
    />
  );
  return (
    <div className="resource-result-with-pin-container ">
      <div className="resource-result-pin-container">
        <Popover getPopUpComponent={getPopUpComponent}>
          <PinButtonIntermediate
            actionAndTriggerPopUp={() => {}}
            isPinned={isPinned}
          />
        </Popover>
      </div>
    </div>
  );
}

function PinPopOverContent({isPinned, submitting, pinItemToProfile}) {
  if (submitting) return <LoadingSpinner />;

  if (isPinned)
    return (
      <div>
        <p>This will remove the pinned item from the page.</p>
        <PrimaryButton onClick={pinItemToProfile}>Confirm</PrimaryButton>
      </div>
    );
  return (
    <div>
      <p>This will replace the current pinned item.</p>
      <PrimaryButton onClick={pinItemToProfile}>Confirm</PrimaryButton>
    </div>
  );
}

function PinButtonIntermediate({actionAndTriggerPopUp, isPinned}) {
  return <PinButton onClick={actionAndTriggerPopUp} isPinned={isPinned} />;
}
