import React, {useEffect, useState} from 'react';

import './SeeMore.css';
export default function SeeMore({
  displayFullDescription,
  setDisplayFullDescription,
  descriptionRef,
  id,
  initialHeight = 100,
}) {
  const [displaySeeMore, setDisplaySeeMore] = useState();
  const windowWidth = window.innerWidth;

  useEffect(() => {
    setDisplaySeeMore(
      Array.from(descriptionRef.current.firstElementChild.children).reduce(
        (accumulator, current) => accumulator + current.scrollHeight + 24,
        0
      ) > initialHeight
    );
  }, [windowWidth, id, descriptionRef]);

  if (!displaySeeMore) return null;
  return (
    <div className="group-description-see-more">
      <button
        className="see-more-button"
        onClick={() =>
          displayFullDescription.display
            ? setDisplayFullDescription({
                display: false,
                size: initialHeight ? initialHeight : 100,
              })
            : setDisplayFullDescription({
                display: true,
                size: Array.from(
                  descriptionRef.current.firstElementChild.children
                ).reduce(
                  (accumulator, current, i) =>
                    accumulator + current.scrollHeight + 24,
                  0
                ),
              })
        }
      >
        {displayFullDescription.display ? <>See less</> : <>See more</>}
      </button>
    </div>
  );
}
