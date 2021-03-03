import React, {useState, useEffect, cloneElement} from 'react';

import './OnHoverPopover.css';

export default function OnHoverPopover({
  children,
  popoverText,
  minWidth,
  width,
}) {
  const [isInfoDisplayed, setIsInfoDisplayed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isHovering) {
      if (isInfoDisplayed) setIsInfoDisplayed(false);
      return;
    }
    const infoAfterTimeout = setTimeout(() => setIsInfoDisplayed(true), 800);
    return () => clearTimeout(infoAfterTimeout);
  }, [isHovering]);

  const popOverChild = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        setIsHovering: setIsHovering,
      });
    }
  });

  return (
    <div className="on-hover-pop-up-relative-container">
      {popOverChild}
      <div
        className={`on-hover-pop-up-info${
          isInfoDisplayed ? '-visible' : '-hidden'
        }`}
        style={{minWidth: minWidth, width: width}}
      >
        {popoverText}
      </div>
    </div>
  );
}
