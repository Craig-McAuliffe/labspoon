import React, {useRef, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {DottedBurgerMenuIcon} from '../../assets/MenuIcons';
import Dropdown, {DropdownOption} from '../Dropdown';
import SeeMore from '../SeeMore';

import './ListItemCommonComponents.css';

export function ListItemContainer({children}) {
  return <div className="general-list-item-container">{children}</div>;
}

export function ExpandableText({children, resourceID, initialHeight = 144}) {
  const [displayFullText, setDisplayFullText] = useState({
    display: false,
    size: initialHeight,
  });

  const containerRef = useRef();

  const containerSize = {
    height: `${displayFullText.size}px`,
  };

  return (
    <>
      <div
        ref={containerRef}
        style={containerSize}
        className="list-item-expandable-container"
      >
        {children}
      </div>
      <SeeMore
        displayFullDescription={displayFullText}
        setDisplayFullDescription={setDisplayFullText}
        descriptionRef={containerRef}
        id={resourceID}
        initialHeight={initialHeight}
      />
    </>
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
