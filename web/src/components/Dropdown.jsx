import React, {useEffect, useRef} from 'react';

import {DropDownTriangle} from '../assets/GeneralActionIcons';

import './Dropdown.css';

export default function Dropdown({
  customToggle,
  setOpenDropdown,
  openDropdown,
  customToggleWidth,
  customToggleTextOnly,
  containerTopPosition,
  children,
}) {
  const dropdownRef = useRef();

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (dropdownRef.current) {
        if (!dropdownRef.current.contains(e.target) && openDropdown === true)
          setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  return (
    <div className="dropdown-relative-position">
      <div className="dropdown-toggle-container">
        {customToggle ? (
          customToggle()
        ) : (
          <button
            className="dropdown-default-toggle"
            style={{width: customToggleWidth}}
            type="button"
            onClick={() => setOpenDropdown(true)}
          >
            <span>
              {customToggleTextOnly === undefined
                ? 'Options'
                : customToggleTextOnly}
            </span>
            <DropDownTriangle />
          </button>
        )}
      </div>
      {openDropdown ? (
        <div
          className="dropdown-container"
          ref={dropdownRef}
          style={containerTopPosition ? {top: containerTopPosition} : null}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownOption({children, onSelect, height}) {
  return (
    <button
      onClick={onSelect}
      className="dropdown-option-button"
      type="button"
      style={{height: height}}
    >
      {children}
    </button>
  );
}
