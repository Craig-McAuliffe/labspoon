import React, {useRef, useState} from 'react';
import SeeMore from '../SeeMore';

import './ListItemCommonComponents.css';

export function ListItemContainer({children}) {
  return <div className="general-list-item-container">{children}</div>;
}

export function ExpandableText({children, resourceID}) {
  const [displayFullText, setDisplayFullText] = useState({
    display: false,
    size: 150,
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
      />
    </>
  );
}
