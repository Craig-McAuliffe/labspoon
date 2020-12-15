import React, {cloneElement, useEffect, useRef, useState} from 'react';

import {DropDownTriangle} from '../assets/GeneralActionIcons';

import './Dropdown.css';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

export default function Dropdown({
  customToggle,
  customToggleWidth,
  customToggleTextOnly,
  containerTopPosition,
  children,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (dropdownRef.current) {
        if (!dropdownRef.current.contains(e.target)) setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  const menuChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        onSelect: () => {
          child.props.onSelect();
          setOpen(false);
        },
      });
    }
    return child;
  });

  return (
    <div className="dropdown-relative-position">
      <DropdownToggle
        customToggle={customToggle}
        customToggleWidth={customToggleWidth}
        setOpen={setOpen}
        customToggleTextOnly={customToggleTextOnly}
      />
      {open ? (
        <DropdownOptions
          dropdownRef={dropdownRef}
          containerTopPosition={containerTopPosition}
        >
          {menuChildren}
        </DropdownOptions>
      ) : null}
    </div>
  );
}

function DropdownToggle({
  customToggle,
  customToggleWidth,
  setOpen,
  customToggleTextOnly,
}) {
  return (
    <div className="dropdown-toggle-container">
      {customToggle ? (
        customToggle({setOpen})
      ) : (
        <button
          className="dropdown-default-toggle"
          style={{width: customToggleWidth}}
          type="button"
          onClick={() => setOpen(true)}
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
  );
}

function DropdownOptions({dropdownRef, containerTopPosition, children}) {
  return (
    <div
      className="dropdown-container"
      ref={dropdownRef}
      style={containerTopPosition ? {top: containerTopPosition} : null}
    >
      {children}
    </div>
  );
}

export function DropdownOption({
  children,
  onSelect,
  height,
  onSomethingElse,
  loading,
}) {
  if (onSomethingElse) onSomethingElse();
  let optionContent;
  if (loading)
    optionContent = (
      <div className="dropdown-option-loading-content">
        <LoadingSpinner />
      </div>
    );
  if (!loading && children) optionContent = children;
  return (
    <button
      onClick={onSelect}
      className="dropdown-option-button"
      type="button"
      style={{height: height}}
    >
      {optionContent}
    </button>
  );
}
