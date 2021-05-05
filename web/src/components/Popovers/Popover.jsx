import React, {
  useRef,
  useState,
  useEffect,
  cloneElement,
  useContext,
} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {AuthContext} from '../../App';
import {BOOKMARK, RECOMMENDATION} from '../../helpers/resourceTypeDefinitions';
import NegativeButton from '../Buttons/NegativeButton';
import PrimaryButton from '../Buttons/PrimaryButton';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './Popover.css';

export const FOLLOW = 'follow';
export const CREATE = 'create';

export function SignUpPopoverOverride({children, text, actionTaken}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const locationPathName = location.pathname;
  const search = location.search;
  const signUpPromptRef = useRef();
  const {user} = useContext(AuthContext);
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (signUpPromptRef.current) {
        if (!signUpPromptRef.current.contains(e.target)) setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  const popOverChild = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      switch (actionTaken) {
        case FOLLOW:
          return cloneElement(child, {
            actionAndTriggerPopUp: () => {
              child.props.actionAndTriggerPopUp();
              if (!user) setOpen(true);
            },
          });
        case CREATE:
          return cloneElement(child, {
            createAction: () => {
              if (!user) setOpen(true);
            },
          });
        case BOOKMARK:
          return cloneElement(child, {
            onBookmark: () => {
              if (!user) setOpen(true);
            },
          });
        case RECOMMENDATION:
          return cloneElement(child, {
            onRecommend: () => {
              if (!user) setOpen(true);
            },
          });
        default:
          return cloneElement(child, {
            actionAndTriggerPopUp: () => {
              if (child.props.actionAndTriggerPopUp)
                child.props.actionAndTriggerPopUp();
              if (!user) setOpen(true);
            },
          });
      }
    }
    return child;
  });

  if (open)
    return (
      <div className="pop-up-relative-container">
        {popOverChild}
        <div className="sign-up-prompt" ref={signUpPromptRef}>
          <Link
            to={{
              pathname: '/signup',
              state: {returnLocation: locationPathName + search},
            }}
          >
            <span>{text}</span>
          </Link>
        </div>
      </div>
    );
  return popOverChild;
}

export default function Popover({
  getPopUpComponent,
  shouldNotOpen,
  children,
  hasOwnRelativeContainer,
}) {
  const [open, setOpen] = useState(false);
  const popOverRef = useRef();

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (popOverRef.current) {
        if (!popOverRef.current.contains(e.target)) setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });
  const popOverChild = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        actionAndTriggerPopUp: () => {
          if (child.props.actionAndTriggerPopUp)
            child.props.actionAndTriggerPopUp();
          if (!shouldNotOpen) setOpen(true);
        },
      });
    }
    return child;
  });
  if (open) {
    if (hasOwnRelativeContainer)
      return (
        <>
          {popOverChild}
          <div ref={popOverRef}>{getPopUpComponent(setOpen)}</div>
        </>
      );
    return (
      <div className="pop-up-relative-container">
        {popOverChild}
        <div ref={popOverRef}>{getPopUpComponent(setOpen)}</div>
      </div>
    );
  }
  return popOverChild;
}

export function StandardPopoverDisplay({
  left,
  right,
  top,
  bottom,
  content,
  noFixedWidth,
  width,
}) {
  return (
    <div
      className={`standard-popover-display${
        noFixedWidth ? '-no-fixed-width' : ''
      }`}
      style={{right: right, left: left, top: top, bottom: bottom, width: width}}
    >
      {content}
    </div>
  );
}

export function SaveOrCancelPopover({
  onSave,
  onCancel,
  top,
  right,
  submitting,
}) {
  const content = submitting ? (
    <LoadingSpinner />
  ) : (
    <>
      <PrimaryButton disabled={submitting} onClick={onSave}>
        Save
      </PrimaryButton>
      <NegativeButton disabled={submitting} onClick={onCancel}>
        Cancel
      </NegativeButton>
    </>
  );
  return (
    <div
      style={{top: top, right: right}}
      className="save-or-cancel-popover-container"
    >
      {content}
    </div>
  );
}
