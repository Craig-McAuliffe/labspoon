import React, {cloneElement, useEffect, useRef, useState} from 'react';

import {DropDownTriangle} from '../assets/GeneralActionIcons';

import './Dropdown.css';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

export default function Dropdown({
  customToggle,
  customToggleWidth,
  customToggleTextOnly,
  containerTopPosition,
  containerRightPosition,
  loading,
  children,
  loadOnExpand,
  customDropdownContainerWidth,
  top,
  right,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const toggleRef = useRef();

  const handleDocumentClick = (e) => {
    if (!dropdownRef.current) return;
    if (toggleRef.current && toggleRef.current.contains(e.target)) return;
    if (!dropdownRef.current.contains(e.target)) setOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  useEffect(async () => {
    if (!open) return;
    if (loadOnExpand) await loadOnExpand();
  }, [open]);

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

  let dropdownContent;
  if (loading)
    dropdownContent = (
      <div className="dropdown-loading-content">
        <LoadingSpinner />
      </div>
    );
  if (!loading && children) dropdownContent = menuChildren;

  return (
    <div className="dropdown-relative-position">
      <DropdownToggle
        customToggle={customToggle}
        customToggleWidth={customToggleWidth}
        setOpen={setOpen}
        customToggleTextOnly={customToggleTextOnly}
        toggleRef={toggleRef}
      />
      {open ? (
        <DropdownOptions
          dropdownRef={dropdownRef}
          containerTopPosition={containerTopPosition}
          containerRightPosition={containerRightPosition}
          customWidth={customDropdownContainerWidth}
          top={top}
          right={right}
        >
          {dropdownContent}
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
  toggleRef,
}) {
  return (
    <div className="dropdown-toggle-container">
      {customToggle ? (
        customToggle(setOpen, toggleRef)
      ) : (
        <button
          className={`dropdown${
            customToggleTextOnly ? '-custom' : '-default'
          }-toggle`}
          style={{width: customToggleWidth}}
          type="button"
          onClick={() => setOpen((currentState) => !currentState)}
          ref={toggleRef}
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

function DropdownOptions({
  dropdownRef,
  containerTopPosition,
  children,
  customWidth,
  containerRightPosition,
}) {
  return (
    <div
      className="dropdown-container"
      ref={dropdownRef}
      style={{
        top: containerTopPosition,
        width: customWidth,
        right: containerRightPosition,
      }}
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
  backgroundShade,
}) {
  if (onSomethingElse) onSomethingElse();
  return (
    <button
      onClick={onSelect}
      className={`dropdown-option-button-${
        backgroundShade ? backgroundShade : 'light'
      }${loading ? '-loading' : ''}`}
      type="button"
      style={{height: height}}
    >
      {children}
    </button>
  );
}

export function SmallDropdownToggle({setOpen, text, toggleRef}) {
  return (
    <button
      className="small-dropdown-toggle"
      ref={toggleRef}
      type="button"
      onClick={() => setOpen((currentState) => !currentState)}
    >
      <p>{text}</p>
      <DropDownTriangle />
    </button>
  );
}
