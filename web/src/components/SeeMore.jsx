import React, {useEffect, useState} from 'react';

export default function SeeMore({
  displayFullDescription,
  setDisplayFullDescription,
  groupDescriptionRef,
  id,
}) {
  const [displaySeeMore, setDisplaySeeMore] = useState();
  const windowWidth = window.innerWidth;

  useEffect(() => {
    setDisplaySeeMore(
      groupDescriptionRef.current.firstElementChild.scrollHeight > 100
    );
  }, [windowWidth, id, groupDescriptionRef]);

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
                size:
                  groupDescriptionRef.current.firstElementChild.scrollHeight,
              })
        }
      >
        {displayFullDescription.display ? <>See less</> : <>See more</>}
      </button>
    </div>
  );
}
