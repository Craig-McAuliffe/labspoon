import React, {useState, useRef, useEffect} from 'react';
import {
  PaddedContent,
  PaddedPageContainer,
  UnpaddedPageContainer,
} from '../../../components/Layout/Content';
import withSizes from 'react-sizes';
import {GroupDetailsHeaderSection} from './GroupDetails';

import './EditGroupDisplay.css';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import {TabsDisplay} from '../../../components/Tabs/Tabs';
import Dropdown, {DropdownOption} from '../../../components/Dropdown';
import NegativeButton from '../../../components/Buttons/NegativeButton';
import ErrorMessage from '../../../components/Forms/ErrorMessage';
import SuccessMessage from '../../../components/Forms/SuccessMessage';
import SphericalLight from '../../../assets/SphericalLight';
import SphericalDark from '../../../assets/SphericalDark';
import SingularityLight from '../../../assets/SingularityLight';
import SingularityDark from '../../../assets/SingularityDark';
import SquaresDark from '../../../assets/SquaresDark';
import SquaresLight from '../../../assets/SquaresLight';
import TowersDark from '../../../assets/TowersDark';
import TowersLight from '../../../assets/TowersLight';
import MandelbrotDark from '../../../assets/MandelbrotDark';
import MandelbrotLight from '../../../assets/MandelbrotLight';
import CyclesDark from '../../../assets/CyclesDark';
import CyclesLight from '../../../assets/CyclesLight';
import {BlankLight} from '../../../assets/BlankBackgrounds';
import {SaveOrCancelPopover} from '../../../components/Popovers/Popover';
import {db} from '../../../firebase';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

export const AVATAR_EMBEDDED_HEADER_DISPLAY = 'embeddedAvatarDisplay';
export const AVATAR_INTERNAL_HEADER_DISPLAY = 'internalAvatarDisplay';
export const NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY = 'noAvatarLeftTextDisplay';
export const NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY = 'noAvatarCenterTextDisplay';

export const TAB_RECTANGLES_DISPLAY = 'tabRectanglesDisplay';
export const TAB_SINGLE_LINE_DIVIDER_DISPLAY = 'tabDoubleLineDividerDisplay';
export const TAB_NO_DIVIDER_DISPLAY = 'tabNoLineDividerDisplay';
export const TAB_DROPDOWN_DISPLAY = 'tabDropdownDisplay';

export const BLANK_LIGHT_BACKGROUND = 'blankLightBackground';
export const SPHERICAL_LIGHT_BACKGROUND = 'sphericalLightBackground';
export const SQUARES_LIGHT_BACKGROUND = 'squaresLightBackground';
export const MANDELBROT_LIGHT_BACKGROUND = 'mandelbrotLightBackground';
export const TOWERS_LIGHT_BACKGROUND = 'towersLightBackground';
export const CYCLES_LIGHT_BACKGROUND = 'cyclesLightBackground';
export const SINGULARITY_LIGHT_BACKGROUND = 'singularityLightBackground';
export const BLANK_DARK_BACKGROUND = 'blankDarkBackground';
export const SPHERICAL_DARK_BACKGROUND = 'sphericalDarkBackground';
export const SQUARES_DARK_BACKGROUND = 'squaresDarkBackground';
export const MANDELBROT_DARK_BACKGROUND = 'mandelbrotDarkBackground';
export const TOWERS_DARK_BACKGROUND = 'towersDarkBackground';
export const CYCLES_DARK_BACKGROUND = 'cyclesDarkBackground';
export const SINGULARITY_DARK_BACKGROUND = 'singularityDarkBackground';

export const LIGHT_NAME_SHADE = 'light';
export const DARK_NAME_SHADE = 'dark';
function backgroundColorBlindNameAndShadeToID(colorBlindDesignName, shade) {
  if (shade === DARK_NAME_SHADE) {
    switch (colorBlindDesignName) {
      case 'BLANK':
        return BLANK_DARK_BACKGROUND;
      case 'SPHERICAL':
        return SPHERICAL_DARK_BACKGROUND;
      case 'SQUARES':
        return SQUARES_DARK_BACKGROUND;
      case 'MANDELBROT':
        return MANDELBROT_DARK_BACKGROUND;
      case 'TOWERS':
        return TOWERS_DARK_BACKGROUND;
      case 'CYCLES':
        return CYCLES_DARK_BACKGROUND;
      case 'SINGULARITY':
        return SINGULARITY_DARK_BACKGROUND;
      default:
        return BLANK_DARK_BACKGROUND;
    }
  }
  switch (colorBlindDesignName) {
    case 'BLANK':
      return BLANK_LIGHT_BACKGROUND;
    case 'SPHERICAL':
      return SPHERICAL_LIGHT_BACKGROUND;
    case 'SQUARES':
      return SQUARES_LIGHT_BACKGROUND;
    case 'MANDELBROT':
      return MANDELBROT_LIGHT_BACKGROUND;
    case 'TOWERS':
      return TOWERS_LIGHT_BACKGROUND;
    case 'CYCLES':
      return CYCLES_LIGHT_BACKGROUND;
    case 'SINGULARITY':
      return SINGULARITY_LIGHT_BACKGROUND;
    default:
      return BLANK_LIGHT_BACKGROUND;
  }
}

export function backgroundDesignIDToSVG(backgroundDesignID) {
  switch (backgroundDesignID) {
    case BLANK_LIGHT_BACKGROUND:
      return null;
    case SPHERICAL_LIGHT_BACKGROUND:
      return <SphericalLight />;
    case SQUARES_LIGHT_BACKGROUND:
      return <SquaresLight />;
    case MANDELBROT_LIGHT_BACKGROUND:
      return <MandelbrotLight />;
    case TOWERS_LIGHT_BACKGROUND:
      return <TowersLight />;
    case CYCLES_LIGHT_BACKGROUND:
      return <CyclesLight />;
    case SINGULARITY_LIGHT_BACKGROUND:
      return <SingularityLight />;
    case BLANK_DARK_BACKGROUND:
      return null;
    case SPHERICAL_DARK_BACKGROUND:
      return <SphericalDark />;
    case SQUARES_DARK_BACKGROUND:
      return <SquaresDark />;
    case MANDELBROT_DARK_BACKGROUND:
      return <MandelbrotDark />;
    case TOWERS_DARK_BACKGROUND:
      return <TowersDark />;
    case CYCLES_DARK_BACKGROUND:
      return <CyclesDark />;
    case SINGULARITY_DARK_BACKGROUND:
      return <SingularityDark />;
    default:
      return <BlankLight />;
  }
}

const COLOR_BLIND_DESIGN_BLANK = 'BLANK';
const COLOR_BLIND_DESIGN_SPHERICAL = 'SPHERICAL';
const COLOR_BLIND_DESIGN_SQUARES = 'SQUARES';
const COLOR_BLIND_DESIGN_MANDELBROT = 'MANDELBROT';
const COLOR_BLIND_DESIGN_TOWERS = 'TOWERS';
const COLOR_BLIND_DESIGN_CYCLES = 'CYCLES';
const COLOR_BLIND_DESIGN_SINGULARITY = 'SINGULARITY';

function backgroundDesignIDToColorBlindDesignAndShade(id) {
  switch (id) {
    case BLANK_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_BLANK,
      };
    case SPHERICAL_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_SPHERICAL,
      };
    case SQUARES_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_SQUARES,
      };
    case MANDELBROT_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_MANDELBROT,
      };
    case TOWERS_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_TOWERS,
      };
    case CYCLES_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_CYCLES,
      };
    case SINGULARITY_LIGHT_BACKGROUND:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_SINGULARITY,
      };
    case BLANK_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_BLANK,
      };
    case SPHERICAL_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_SPHERICAL,
      };
    case SQUARES_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_SQUARES,
      };
    case MANDELBROT_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_MANDELBROT,
      };
    case TOWERS_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_TOWERS,
      };
    case CYCLES_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_CYCLES,
      };
    case SINGULARITY_DARK_BACKGROUND:
      return {
        shade: DARK_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_SINGULARITY,
      };
    default:
      return {
        shade: LIGHT_NAME_SHADE,
        colorBlindDesign: COLOR_BLIND_DESIGN_BLANK,
      };
  }
}

const colorBlindDesignOptions = [
  COLOR_BLIND_DESIGN_BLANK,
  COLOR_BLIND_DESIGN_SPHERICAL,
  COLOR_BLIND_DESIGN_SQUARES,
  COLOR_BLIND_DESIGN_MANDELBROT,
  COLOR_BLIND_DESIGN_TOWERS,
  COLOR_BLIND_DESIGN_CYCLES,
  COLOR_BLIND_DESIGN_SINGULARITY,
];

const exampleTabs = [
  'Posts',
  'Publications',
  'Members',
  'Research Focuses',
  'Techniques',
  'Photos',
  'Videos',
  'Open Positions',
];
const mapEditGroupDisplaySizesToProps = ({width}) => ({
  isMobile: width && width <= 400,
});

function EditGroupDisplay({groupData, groupID, children, isMobile}) {
  const [displayedBackgroundDesign, setDisplayedBackgroundDesign] = useState(
    groupData.backgroundDesign
      ? backgroundDesignIDToColorBlindDesignAndShade(groupData.backgroundDesign)
          .colorBlindDesign
      : colorBlindDesignOptions[0]
  );
  const [selectedNavigationType, setSelectedNavigationType] = useState(
    groupData.navigationDisplayType
      ? groupData.navigationDisplayType
      : TAB_RECTANGLES_DISPLAY
  );
  const [selectedHeaderNameShade, setSelectedHeaderNameShade] = useState(
    groupData.headerNameShade ? groupData.headerNameShade : LIGHT_NAME_SHADE
  );
  const [successfulSubmit, setSuccessfulSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedHeaderType, setSelectedHeaderType] = useState(
    groupData.headerDisplayType
      ? groupData.headerDisplayType
      : AVATAR_EMBEDDED_HEADER_DISPLAY
  );
  const [darkOrLightBackground, setDarkOrLightBackground] = useState(
    groupData.backgroundDesign
      ? backgroundDesignIDToColorBlindDesignAndShade(groupData.backgroundDesign)
          .shade
      : LIGHT_NAME_SHADE
  );
  const [changesMade, setChangesMade] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!successfulSubmit) return;
    const successResetTimeout = setTimeout(
      () => setSuccessfulSubmit(false),
      3000
    );
    return () => clearTimeout(successResetTimeout);
  }, [successfulSubmit]);

  const checkForBackgroundDisplayChange = () => {
    if (
      displayedBackgroundDesign !==
        backgroundDesignIDToColorBlindDesignAndShade(groupData.backgroundDesign)
          .colorBlindDesign ||
      darkOrLightBackground !==
        backgroundDesignIDToColorBlindDesignAndShade(groupData.backgroundDesign)
          .shade
    )
      return true;
    return false;
  };

  const checkForNavigationDisplayChange = () => {
    if (
      groupData.navigationDisplayType !== selectedNavigationType &&
      !(
        selectedNavigationType === TAB_RECTANGLES_DISPLAY &&
        !groupData.navigationDisplayType
      )
    )
      return true;
    return false;
  };

  const checkForHeaderDisplayChange = () => {
    if (
      groupData.headerDisplayType !== selectedHeaderType &&
      !(
        selectedHeaderType === AVATAR_EMBEDDED_HEADER_DISPLAY &&
        !groupData.headerDisplayType
      )
    )
      return true;
    return false;
  };

  const checkForHeaderNameShadeChange = () => {
    if (
      selectedHeaderNameShade !== groupData.headerNameShade &&
      !(
        !groupData.headerNameShade &&
        selectedHeaderNameShade === LIGHT_NAME_SHADE
      )
    )
      return true;
    return false;
  };

  const modifyGroupDataWithNewOptions = () => {
    if (checkForBackgroundDisplayChange())
      groupData.backgroundDesign = backgroundColorBlindNameAndShadeToID(
        displayedBackgroundDesign,
        darkOrLightBackground
      );
    if (checkForNavigationDisplayChange())
      groupData.navigationDisplayType = selectedNavigationType;
    if (checkForHeaderDisplayChange())
      groupData.headerDisplayType = selectedHeaderType;
    if (checkForHeaderNameShadeChange())
      groupData.headerNameShade = selectedHeaderNameShade;
  };

  const submitChanges = async () => {
    setSubmitting(true);
    if (submitError) setSubmitError(false);
    if (successfulSubmit) setSuccessfulSubmit(false);
    const batch = db.batch();
    if (checkForBackgroundDisplayChange())
      batch.update(db.doc(`groups/${groupID}`), {
        backgroundDesign: backgroundColorBlindNameAndShadeToID(
          displayedBackgroundDesign,
          darkOrLightBackground
        ),
      });
    if (checkForNavigationDisplayChange())
      batch.update(db.doc(`groups/${groupID}`), {
        navigationDisplayType: selectedNavigationType,
      });

    if (checkForHeaderDisplayChange())
      batch.update(db.doc(`groups/${groupID}`), {
        headerDisplayType: selectedHeaderType,
      });

    if (checkForHeaderNameShadeChange())
      batch.update(db.doc(`groups/${groupID}`), {
        headerNameShade: selectedHeaderNameShade,
      });
    return batch
      .commit()
      .then(() => {
        modifyGroupDataWithNewOptions();
        setSuccessfulSubmit(true);
        setSubmitting(false);
      })
      .catch((err) => {
        console.error(
          `unable to commit display option changes for group with id ${groupID} ${err}`
        );
        setSubmitError(true);
        setSubmitting(false);
      });
  };

  const resetDisplayOptions = () => {
    setSelectedHeaderType(
      groupData.headerDisplayType
        ? groupData.headerDisplayType
        : AVATAR_EMBEDDED_HEADER_DISPLAY
    );
    setDisplayedBackgroundDesign(
      groupData.backgroundDesign
        ? backgroundDesignIDToColorBlindDesignAndShade(
            groupData.backgroundDesign
          ).colorBlindDesign
        : colorBlindDesignOptions[0]
    );
    setSelectedNavigationType(
      groupData.navigationDisplayType
        ? groupData.navigationDisplayType
        : TAB_RECTANGLES_DISPLAY
    );
    setDarkOrLightBackground(
      groupData.backgroundDesign
        ? backgroundDesignIDToColorBlindDesignAndShade(
            groupData.backgroundDesign
          ).shade
        : LIGHT_NAME_SHADE
    );
    setSelectedHeaderNameShade(
      groupData.headerNameShade ? groupData.headerNameShade : LIGHT_NAME_SHADE
    );
  };

  // detect changes to display options
  useEffect(() => {
    if (
      checkForBackgroundDisplayChange() ||
      checkForNavigationDisplayChange() ||
      checkForHeaderDisplayChange() ||
      checkForHeaderNameShadeChange()
    ) {
      if (!changesMade) setChangesMade(true);
      return;
    }
    if (changesMade) setChangesMade(false);
  }, [
    displayedBackgroundDesign,
    selectedHeaderNameShade,
    selectedNavigationType,
    selectedHeaderType,
    successfulSubmit,
    darkOrLightBackground,
  ]);

  if (submitting)
    return (
      <PaddedPageContainer>
        {children}
        <LoadingSpinner />
        <h3 className="edit-group-display-saving-changes-message">
          Saving your changes, please do not leave or refresh the page.
        </h3>
      </PaddedPageContainer>
    );
  return (
    <UnpaddedPageContainer>
      <PaddedContent>
        {children}
        {submitError && (
          <div className="edit-group-display-page-success-error-container">
            <ErrorMessage>
              Something went wrong while saving those changes. Please try again.
            </ErrorMessage>
          </div>
        )}
        {successfulSubmit && (
          <SuccessMessage isOverlay={true}>
            Your chosen options were successfully saved
          </SuccessMessage>
        )}
        <EditGroupDisplayHeaderSection
          groupData={groupData}
          groupID={groupID}
          isMobile={isMobile}
          selectedHeaderType={selectedHeaderType}
          setSelectedHeaderType={setSelectedHeaderType}
          selectedHeaderNameShade={selectedHeaderNameShade}
          setSelectedHeaderNameShade={setSelectedHeaderNameShade}
        />
        <EditGroupDisplayNavigationSection
          selectedNavigationType={selectedNavigationType}
          setSelectedNavigationType={setSelectedNavigationType}
        />
      </PaddedContent>

      <EditGroupBackgroundDisplaySection
        displayedBackgroundDesign={displayedBackgroundDesign}
        setDisplayedBackgroundDesign={setDisplayedBackgroundDesign}
        darkOrLightBackground={darkOrLightBackground}
        setDarkOrLightBackground={setDarkOrLightBackground}
      />
      {changesMade && (
        <SaveOrCancelPopover
          submitting={submitting}
          onCancel={resetDisplayOptions}
          onSave={submitChanges}
        />
      )}
    </UnpaddedPageContainer>
  );
}

function EditGroupDisplayNavigationSection({
  selectedNavigationType,
  setSelectedNavigationType,
}) {
  return (
    <div className="edit-group-display-navigation-section">
      <h2 className="edit-group-display-sub-title">Navigation</h2>
      <div
        className={`edit-group-display-tab-container${
          selectedNavigationType === TAB_RECTANGLES_DISPLAY ? '-selected' : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedNavigationType === TAB_RECTANGLES_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() => {
                if (selectedNavigationType === TAB_RECTANGLES_DISPLAY) return;
                setSelectedNavigationType(TAB_RECTANGLES_DISPLAY);
              }}
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <TabsDisplay
          noBorderOrMargin={true}
          displayType={TAB_RECTANGLES_DISPLAY}
          tabNamesOnly={exampleTabs}
        />
      </div>
      <div
        className={`edit-group-display-tab-container${
          selectedNavigationType === TAB_SINGLE_LINE_DIVIDER_DISPLAY
            ? '-selected'
            : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedNavigationType === TAB_SINGLE_LINE_DIVIDER_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() => {
                if (selectedNavigationType === TAB_SINGLE_LINE_DIVIDER_DISPLAY)
                  return;
                setSelectedNavigationType(TAB_SINGLE_LINE_DIVIDER_DISPLAY);
              }}
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <TabsDisplay
          noBorderOrMargin={true}
          displayType={TAB_SINGLE_LINE_DIVIDER_DISPLAY}
          tabNamesOnly={exampleTabs}
        />
      </div>
      <div
        className={`edit-group-display-tab-container${
          selectedNavigationType === TAB_NO_DIVIDER_DISPLAY ? '-selected' : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedNavigationType === TAB_NO_DIVIDER_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() => {
                if (selectedNavigationType === TAB_NO_DIVIDER_DISPLAY) return;
                setSelectedNavigationType(TAB_NO_DIVIDER_DISPLAY);
              }}
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <TabsDisplay
          noBorderOrMargin={true}
          displayType={TAB_NO_DIVIDER_DISPLAY}
          tabNamesOnly={exampleTabs}
        />
      </div>
      <div
        className={`edit-group-display-tab-container${
          selectedNavigationType === TAB_DROPDOWN_DISPLAY ? '-selected' : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedNavigationType === TAB_DROPDOWN_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() => {
                if (selectedNavigationType === TAB_DROPDOWN_DISPLAY) return;
                setSelectedNavigationType(TAB_DROPDOWN_DISPLAY);
              }}
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <TabsDisplay
          noBorderOrMargin={true}
          displayType={TAB_DROPDOWN_DISPLAY}
          tabNamesOnly={exampleTabs}
        />
      </div>
    </div>
  );
}

function EditGroupDisplayHeaderSection({
  groupData,
  groupID,
  isMobile,
  setSelectedHeaderType,
  selectedHeaderType,
  selectedHeaderNameShade,
  setSelectedHeaderNameShade,
}) {
  return (
    <div className="edit-group-display-header-section">
      <h2 className="edit-group-display-sub-title">Header</h2>
      <div
        className={`edit-group-display-option-container${
          selectedHeaderType === AVATAR_EMBEDDED_HEADER_DISPLAY
            ? '-selected'
            : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedHeaderType === AVATAR_EMBEDDED_HEADER_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() =>
                setSelectedHeaderType(AVATAR_EMBEDDED_HEADER_DISPLAY)
              }
            >
              Select
            </SecondaryButton>
          )}
        </div>

        <GroupDetailsHeaderSection
          displayType={AVATAR_EMBEDDED_HEADER_DISPLAY}
          group={groupData}
          groupID={groupID}
          userIsMember={true}
          isMobile={isMobile}
          designOnly={true}
        />
      </div>
      <div
        className={`edit-group-display-option-container${
          selectedHeaderType === AVATAR_INTERNAL_HEADER_DISPLAY
            ? '-selected'
            : ''
        }`}
      >
        <div className="edit-group-display-selector-and-shade-container">
          <div className="edit-group-display-light-or-dark-container">
            <button
              onClick={() => {
                if (selectedHeaderNameShade === LIGHT_NAME_SHADE) return;
                setSelectedHeaderNameShade(LIGHT_NAME_SHADE);
              }}
              className={`edit-group-display-light-or-dark-button${
                selectedHeaderNameShade === LIGHT_NAME_SHADE
                  ? '-active'
                  : '-inactive'
              }`}
            >
              <h3>Light Text</h3>
            </button>
            <button
              onClick={() => {
                if (selectedHeaderNameShade === DARK_NAME_SHADE) return;
                setSelectedHeaderNameShade(DARK_NAME_SHADE);
              }}
              className={`edit-group-display-light-or-dark-button${
                selectedHeaderNameShade === DARK_NAME_SHADE
                  ? '-active'
                  : '-inactive'
              }`}
            >
              <h3>Dark Text</h3>
            </button>
          </div>
          {selectedHeaderType === AVATAR_INTERNAL_HEADER_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() =>
                setSelectedHeaderType(AVATAR_INTERNAL_HEADER_DISPLAY)
              }
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <GroupDetailsHeaderSection
          displayType={AVATAR_INTERNAL_HEADER_DISPLAY}
          group={groupData}
          groupID={groupID}
          userIsMember={true}
          isMobile={isMobile}
          designOnly={true}
          nameShade={selectedHeaderNameShade}
        />
      </div>
      <div
        className={`edit-group-display-option-container${
          selectedHeaderType === NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY
            ? '-selected'
            : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedHeaderType === NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() =>
                setSelectedHeaderType(NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY)
              }
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <GroupDetailsHeaderSection
          displayType={NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY}
          group={groupData}
          groupID={groupID}
          userIsMember={true}
          isMobile={isMobile}
          designOnly={true}
        />
      </div>
      <div
        className={`edit-group-display-option-container${
          selectedHeaderType === NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY
            ? '-selected'
            : ''
        }`}
      >
        <div className="edit-group-display-selector-container">
          {selectedHeaderType === NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY ? (
            <span>Selected</span>
          ) : (
            <SecondaryButton
              onClick={() =>
                setSelectedHeaderType(NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY)
              }
            >
              Select
            </SecondaryButton>
          )}
        </div>
        <GroupDetailsHeaderSection
          displayType={NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY}
          group={groupData}
          groupID={groupID}
          userIsMember={true}
          isMobile={isMobile}
          designOnly={true}
          nameShade={selectedHeaderNameShade}
        />
      </div>
    </div>
  );
}
function EditGroupBackgroundDisplaySection({
  displayedBackgroundDesign,
  setDisplayedBackgroundDesign,
  darkOrLightBackground,
  setDarkOrLightBackground,
}) {
  const [
    isDisplayingContentInPreview,
    setIsDisplayingContentInPreview,
  ] = useState(false);
  const [containerRelativeHeight, setContainerRelativeHeight] = useState(500);
  const contentWidthRef = useRef();

  const reportWindowSize = () => {
    if (!contentWidthRef.current) return;
    setContainerRelativeHeight(contentWidthRef.current.scrollWidth * 0.65);
  };

  useEffect(() => {
    window.addEventListener('resize', reportWindowSize);
    reportWindowSize();
    return () => window.removeEventListener('resize', reportWindowSize);
  }, [contentWidthRef]);
  return (
    <UnpaddedPageContainer>
      <PaddedContent>
        <h2 className="edit-group-display-sub-title">Background</h2>
        <div className="edit-group-display-background-section">
          <Dropdown customToggleTextOnly={displayedBackgroundDesign}>
            {getDesignOptions(setDisplayedBackgroundDesign)}
          </Dropdown>
          <div className="edit-group-display-light-or-dark-container">
            <button
              onClick={() => setDarkOrLightBackground('light')}
              className={`edit-group-display-light-or-dark-button${
                darkOrLightBackground === 'light' ? '-active' : '-inactive'
              }`}
            >
              <h3>Light</h3>
            </button>
            <button
              onClick={() => setDarkOrLightBackground('dark')}
              className={`edit-group-display-light-or-dark-button${
                darkOrLightBackground === 'dark' ? '-active' : '-inactive'
              }`}
            >
              <h3>Dark</h3>
            </button>
          </div>
          <div className="edit-group-display-show-content-button-container">
            <NegativeButton
              onClick={() =>
                setIsDisplayingContentInPreview((currentState) => !currentState)
              }
            >
              {isDisplayingContentInPreview
                ? 'Hide content'
                : 'Show with content'}
            </NegativeButton>
          </div>
        </div>
      </PaddedContent>

      <div
        ref={contentWidthRef}
        className="edit-group-display-preview-positioning-sizing"
        style={{height: containerRelativeHeight + 'px'}}
      >
        <div
          className={`edit-group-display-preview-background${
            darkOrLightBackground === 'dark' ? '-dark' : '-light'
          }`}
        >
          <div className="background-container-preview">
            {backgroundDesignIDToSVG(
              backgroundColorBlindNameAndShadeToID(
                displayedBackgroundDesign,
                darkOrLightBackground
              )
            )}
          </div>
          {isDisplayingContentInPreview && (
            <div className="edit-group-preview-layout">
              <div
                className={`edit-group-preview-sider-left${
                  darkOrLightBackground === 'dark' ? '-dark' : ''
                }`}
              ></div>
              <div className="edit-group-preview-content">
                <div
                  className={`edit-group-preview-group-header-section${
                    darkOrLightBackground === 'dark' ? '-dark' : '-light'
                  }`}
                >
                  <div
                    className={`edit-group-preview-group-name${
                      darkOrLightBackground === 'dark' ? '-dark' : ''
                    }`}
                  >
                    <h4>Group Name</h4>
                    <h4 className="edit-group-display-preview-institution">
                      Institution
                    </h4>
                  </div>
                  <div
                    className={`edit-group-preview-group-cover${
                      darkOrLightBackground === 'dark' ? '-dark' : ''
                    }`}
                  >
                    <div className="edit-group-preview-group-avatar"></div>
                  </div>
                </div>
                <div
                  className={`edit-group-preview-group-content-block${
                    darkOrLightBackground === 'dark' ? '-dark' : ''
                  }`}
                ></div>
                <div
                  className={`edit-group-preview-group-content-block-2${
                    darkOrLightBackground === 'dark' ? '-dark' : ''
                  }`}
                ></div>
                <div
                  className={`edit-group-preview-group-content-block-3${
                    darkOrLightBackground === 'dark' ? '-dark' : ''
                  }`}
                ></div>
                <div
                  className={`edit-group-preview-group-content-block-3${
                    darkOrLightBackground === 'dark' ? '-dark' : ''
                  }`}
                ></div>
              </div>
              <div
                className={`edit-group-preview-sider-right${
                  darkOrLightBackground === 'dark' ? '-dark' : ''
                }`}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div style={{height: '50px', background: '#ffffff'}}></div>
    </UnpaddedPageContainer>
  );
}
function getDesignOptions(setDisplayedBackgroundDesign) {
  return colorBlindDesignOptions.map((colorBlindDesignOption) => (
    <DropdownOption
      key={colorBlindDesignOption}
      onSelect={() => {
        setDisplayedBackgroundDesign(colorBlindDesignOption);
      }}
    >
      <h4>{colorBlindDesignOption}</h4>
    </DropdownOption>
  ));
}

// Tracks window width and sends boolean prop
export default withSizes(mapEditGroupDisplaySizesToProps)(EditGroupDisplay);
