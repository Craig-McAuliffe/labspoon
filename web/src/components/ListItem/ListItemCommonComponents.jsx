import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {EditIcon, PinIcon} from '../../assets/GeneralActionIcons';
import {DottedBurgerMenuIcon} from '../../assets/MenuIcons';
import {db} from '../../firebase';
import {OPENPOSITION} from '../../helpers/resourceTypeDefinitions';
import PinButton from '../Buttons/PinButton';
import Dropdown, {DropdownOption} from '../Dropdown';
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

export function ListItemOptionsDropdown({
  resourceType,
  resourceID,
  item,
  pinProfileID,
  pinProfileCollection,
}) {
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
        <ListItemOptionsDropDownOptions
          onSelect={() => {}}
          resourceType={resourceType}
          resourceID={resourceID}
          item={item}
          pinProfileID={pinProfileID}
          pinProfileCollection={pinProfileCollection}
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
}) {
  const history = useHistory();

  const getCustomDisplay = (isPinned, pinItem) => {
    return (
      <DropdownOption
        onSelect={() => {
          onSelect();
          pinItem();
        }}
      >
        <h4 className="list-item-options-dropdown-text">
          <PinIcon />
          {isPinned ? 'Unpin' : 'Pin'}
        </h4>
      </DropdownOption>
    );
  };

  return (
    <>
      {resourceType !== OPENPOSITION && (
        <DropdownOption
          onSelect={() => {
            onSelect();
            history.replace(`/${resourceType}/${resourceID}/edit`, {
              previousLocation: history.location.pathname,
            });
          }}
        >
          <h4 className="list-item-options-dropdown-text">
            <EditIcon />
            Edit
          </h4>
        </DropdownOption>
      )}
      {item.showPinOption && (
        <PinListItem
          item={item}
          getCustomDisplay={getCustomDisplay}
          pinProfileID={pinProfileID}
          pinProfileCollection={pinProfileCollection}
        />
      )}
    </>
  );
}

export function PinListItem({
  pinProfileID,
  pinProfileCollection,
  item,
  getCustomDisplay,
}) {
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

  const pinItemToProfile = async () => {
    setSubmitting(true);
    if (isPinned) {
      return db
        .doc(`${pinProfileCollection}/${pinProfileID}`)
        .update({
          pinnedItem: null,
        })
        .then(() => {
          if (submitting) setSubmitting(false);
          testIfItemIsPinned();
        })
        .catch(() => {
          alert(
            'Something went wrong while pinning that item. Please try again.'
          );
          setSubmitting(false);
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
        setSubmitting(false);
        testIfItemIsPinned();
      })
      .catch((err) => {
        console.error(
          `unable to pin ${item.resourceType} to ${pinProfileCollection} with id ${pinProfileID} ${err}`
        );
        alert(
          'Something went wrong while pinning that item. Please try again.'
        );
        setSubmitting(false);
      });
  };

  if (getCustomDisplay) return getCustomDisplay(isPinned, pinItemToProfile);
  return (
    <div className="resource-result-with-pin-container ">
      <div className="resource-result-pin-container">
        <PinButton
          onClick={submitting ? () => {} : pinItemToProfile}
          isPinned={isPinned}
        />
      </div>
    </div>
  );
}
