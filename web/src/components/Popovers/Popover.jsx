import React, {useRef, useState, useEffect, cloneElement} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {BOOKMARK, RECOMMENDATION} from '../../helpers/resourceTypeDefinitions';

import './Popover.css';

export const FOLLOW = 'follow';
export const CREATE = 'create';

export function SignUpPopoverOverride({children, text, actionTaken}) {
  const [open, setOpen] = useState(false);
  const locationPathName = useLocation().pathname;
  const signUpPromptRef = useRef();

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
            followAction: () => {
              child.props.followAction();
              setOpen(true);
            },
          });
        case CREATE:
          return cloneElement(child, {
            createAction: () => {
              setOpen(true);
            },
          });
        case BOOKMARK:
          return cloneElement(child, {
            onBookmark: () => {
              setOpen(true);
            },
          });
        case RECOMMENDATION:
          return cloneElement(child, {
            onRecommend: () => {
              setOpen(true);
            },
          });
        default:
          return cloneElement(child, {
            followAction: () => {
              setOpen(true);
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
              state: {returnLocation: locationPathName},
            }}
          >
            {text}
          </Link>
        </div>
      </div>
    );
  return popOverChild;
}
