import React, {useEffect, useRef, useState} from 'react';
import withSizes from 'react-sizes';

import './SeeMore.css';

const mapSeeMoreSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 600,
  isSmallMobile: width && width <= 400,
  width: width,
});

// Tracks window width and sends boolean prop to
// SimilarContentSider if below 800px
export default withSizes(mapSeeMoreSizesToProps)(SeeMore);

const MONITOR = 'monitor';
const MOBILE = 'mobile';
const SMALL_MOBILE = 'smallMobile';
const EXPANDED = 'expanded';
const UNEXPANDED = 'unexpanded';
function SeeMore({
  id,
  initialHeight = 144,
  fullScreenInitialLineHeight = 24,
  mobileScreenInitialLineHeight = 22,
  smallMobileScreenInitialLineHeight = 21,
  isMobile,
  width,
  children,
  yPadding,
  backgroundShade,
  isSmallMobile,
}) {
  // + 4 for some padding on larger devices
  const [displaySeeMore, setDisplaySeeMore] = useState(false);
  const [unexpandedHeight, setUnexpandedHeight] = useState(
    yPadding ? initialHeight + yPadding + 4 : initialHeight + 4
  );
  const [sizeVariant, setSizeVariant] = useState(MONITOR);
  const [containerStateAndHeight, setContainerStateAndHeight] = useState({
    height: yPadding ? initialHeight + yPadding : initialHeight,
    state: UNEXPANDED,
  });

  const containerRef = useRef();

  useEffect(() => {
    if (isSmallMobile && sizeVariant !== SMALL_MOBILE) {
      setUnexpandedHeight(() => {
        let newHeight =
          (initialHeight / fullScreenInitialLineHeight) *
          smallMobileScreenInitialLineHeight;
        if (yPadding) newHeight = newHeight + yPadding;
        return newHeight;
      });
      setSizeVariant(SMALL_MOBILE);
    }
    if (isMobile && !isSmallMobile && sizeVariant !== MOBILE) {
      setUnexpandedHeight(() => {
        let newHeight =
          (initialHeight / fullScreenInitialLineHeight) *
          mobileScreenInitialLineHeight;
        if (yPadding) newHeight = newHeight + yPadding;
        return newHeight;
      });
      setSizeVariant(MOBILE);
    }
    if (!isMobile && !isSmallMobile && sizeVariant !== MONITOR) {
      setUnexpandedHeight(
        yPadding ? initialHeight + yPadding + 4 : initialHeight + 4
      );
      setSizeVariant(MONITOR);
    }
  }, [isMobile, isSmallMobile]);

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
        className={`see-more-container-${
          backgroundShade ? backgroundShade : 'light'
        }`}
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
          backgroundShade={backgroundShade}
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
  backgroundShade,
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
      <button
        className={`see-more-button-${
          backgroundShade ? backgroundShade : 'light'
        }`}
        onClick={() => minimiseOrExpand()}
      >
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
