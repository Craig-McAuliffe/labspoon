import React, {useEffect, useState} from 'react';

import './SeeMore.css';
export default function SeeMore({
  displayFullDescription,
  setDisplayFullDescription,
  descriptionRef,
  id,
}) {
  const [displaySeeMore, setDisplaySeeMore] = useState();
  const windowWidth = window.innerWidth;

  useEffect(() => {
    setDisplaySeeMore(
      descriptionRef.current.firstElementChild.scrollHeight > 100
    );
  }, [windowWidth, id, descriptionRef]);

  if (!displaySeeMore) return null;
  return (
    <div className="group-description-see-more">
      <button
        className="see-more-button"
        onClick={() =>
          displayFullDescription.display
            ? setDisplayFullDescription({display: false, size: 100})
            : setDisplayFullDescription({
                display: true,
                size: descriptionRef.current.firstElementChild.scrollHeight,
              })
        }
      >
        {displayFullDescription.display ? <>See less</> : <>See more</>}
      </button>
    </div>
  );
}
