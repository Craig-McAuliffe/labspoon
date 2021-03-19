import React, {useEffect, useRef, useState} from 'react';
import withSizes from 'react-sizes';

import './SeeMore.css';

const mapSeeMoreSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 500,
  width: width,
});

// Tracks window width and sends boolean prop to
// SimilarContentSider if below 800px
export default withSizes(mapSeeMoreSizesToProps)(SeeMore);

const EXPANDED = 'expanded';
const UNEXPANDED = 'unexpanded';
function SeeMore({
  id,
  initialHeight = 144,
  fullScreenInitialLineHeight = 24,
  mobileScreenInitialLineHeight = 22,
  isMobile,
  width,
  children,
}) {
  const [displaySeeMore, setDisplaySeeMore] = useState(false);
  const [unexpandedHeight, setUnexpandedHeight] = useState(initialHeight);
  const [isUsingMobileVariation, setIsUsingMobileVariation] = useState(false);
  const [containerStateAndHeight, setContainerStateAndHeight] = useState({
    height: initialHeight,
    state: UNEXPANDED,
  });

  const containerRef = useRef();

  useEffect(() => {
    if (isMobile && !isUsingMobileVariation) {
      setUnexpandedHeight(
        (initialHeight / fullScreenInitialLineHeight) *
          mobileScreenInitialLineHeight
      );
      setIsUsingMobileVariation(true);
    }
    if (!isMobile && isUsingMobileVariation) {
      setUnexpandedHeight(initialHeight);
      setIsUsingMobileVariation(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (containerStateAndHeight.height === unexpandedHeight) return;
    setContainerStateAndHeight((currentStateAndHeight) => {
      return {
        state: currentStateAndHeight.state,
        height:
          currentStateAndHeight.state === EXPANDED
            ? getHeightFromRichBody(
                containerRef,
                mobileScreenInitialLineHeight,
                fullScreenInitialLineHeight,
                isMobile
              )
            : unexpandedHeight,
      };
    });
  }, [unexpandedHeight]);

  useEffect(() => {
    const shouldDisplaySeeMoreButton =
      getHeightFromRichBody(
        containerRef,
        mobileScreenInitialLineHeight,
        fullScreenInitialLineHeight,
        isMobile
      ) > unexpandedHeight;
    if (shouldDisplaySeeMoreButton === displaySeeMore) return;
    setDisplaySeeMore(shouldDisplaySeeMoreButton);
  }, [width, id, containerRef]);

  return (
    <>
      <div
        className="see-more-container"
        ref={containerRef}
        style={{height: containerStateAndHeight.height + 'px'}}
      >
        {children}
      </div>
      {displaySeeMore && (
        <SeeMoreButton
          setContainerStateAndHeight={setContainerStateAndHeight}
          containerStateAndHeight={containerStateAndHeight}
          unexpandedHeight={unexpandedHeight}
          mobileScreenInitialLineHeight={mobileScreenInitialLineHeight}
          fullScreenInitialLineHeight={fullScreenInitialLineHeight}
          isMobile={isMobile}
          containerRef={containerRef}
        />
      )}
    </>
  );
}

function SeeMoreButton({
  setContainerStateAndHeight,
  containerStateAndHeight,
  unexpandedHeight,
  mobileScreenInitialLineHeight,
  fullScreenInitialLineHeight,
  isMobile,
  containerRef,
}) {
  const minimiseOrExpand = () => {
    if (containerStateAndHeight.state !== EXPANDED)
      return setContainerStateAndHeight({
        height: getHeightFromRichBody(
          containerRef,
          mobileScreenInitialLineHeight,
          fullScreenInitialLineHeight,
          isMobile
        ),
        state: EXPANDED,
      });
    return setContainerStateAndHeight({
      height: unexpandedHeight,
      state: UNEXPANDED,
    });
  };
  return (
    <div className="group-description-see-more">
      <button className="see-more-button" onClick={() => minimiseOrExpand()}>
        {containerStateAndHeight.state === EXPANDED ? (
          <>See less</>
        ) : (
          <>See more</>
        )}
      </button>
    </div>
  );
}

function getHeightFromRichBody(
  containerRef,
  mobileScreenInitialLineHeight,
  fullScreenInitialLineHeight,
  isMobile
) {
  return Array.from(containerRef.current.children[0].children).reduce(
    (accumulator, current, i) => {
      let paragraphBreakHeight = 0;
      if (current.scrollHeight > 0)
        paragraphBreakHeight = isMobile
          ? mobileScreenInitialLineHeight
          : fullScreenInitialLineHeight;
      return accumulator + current.scrollHeight + paragraphBreakHeight;
    },
    0
  );
}
