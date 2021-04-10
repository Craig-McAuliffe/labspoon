import React, {useState} from 'react';
import {
  PaddedContent,
  UnpaddedPageContainer,
} from '../../../components/Layout/Content';
import {ListItemContainer} from '../../../components/ListItem/ListItemCommonComponents';
import withSizes from 'react-sizes';
import {GroupDetailsHeaderSection} from './GroupDetails';

import './EditGroupDisplay.css';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import {TabsDisplay} from '../../../components/FilterableResults/FilterableResults';
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
// import { SaveOrCancelPopover } from '../../../components/Popovers/Popover';

export const AVATAR_EMBEDDED_DISPLAY = 'embeddedAvatarDisplay';
export const AVATAR_INTERNAL_DISPLAY = 'internalAvatarDisplay';
export const NO_AVATAR_LEFT_TEXT_DISPLAY = 'noAvatarLeftTextDisplay';
export const NO_AVATAR_CENTER_TEXT_DISPLAY = 'noAvatarCenterTextDisplay';

export const TAB_RECTANGLES_DISPLAY = 'tabRectanglesDisplay';
export const TAB_DOUBLE_LINE_DIVIDER_DISPLAY = 'tabRectanglesDisplay';
export const TAB_NO_DIVIDER_DISPLAY = 'tabRectanglesDisplay';
export const TAB_DROPDOWN_DISPLAY = 'tabRectanglesDisplay';

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

function backgroundColorBlindNameAndShadeToID(colorBlindDesignName, shade) {
  if (shade === 'dark') {
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

function backgroundDesignIDToSVG(backgroundDesignID) {
  switch (backgroundDesignID) {
    case BLANK_LIGHT_BACKGROUND:
      return <BlankLight />;
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

const colorBlindDesignOptions = [
  'BLANK',
  'SPHERICAL',
  'SQUARES',
  'MANDELBROT',
  'TOWERS',
  'CYCLES',
  'SINGULARITY',
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
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 400,
});

// TO DO - Selected Displays should have blue hover around them (including if current display for group)
// TO DO - Can click anywhere on display to select or deselect them

function EditGroupDisplay({groupData, groupID, children, isMobile}) {
  const [displayedBackgroundDesign, setDisplayedBackgroundDesign] = useState(
    groupData.backgroundDesign
      ? groupData.backgroundDesign
      : colorBlindDesignOptions[0]
  );
  const [
    isDisplayingContentInPreview,
    setIsDisplayingContentInPreview,
  ] = useState(false);
  const [successfulSubmit, setSuccessfulSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [darkOrLightBackground, setDarkOrLightBackground] = useState(() => {
    if (groupData.backgroundDesign) {
      if (groupData.backgroundDesign.toLowerCase().includes('dark'))
        return 'dark';
      return 'light';
    }
    return 'light';
  });
  if (1 == 2) {
    setSuccessfulSubmit(true);
    setSubmitError(true);
  }
  return (
    <UnpaddedPageContainer>
      <PaddedContent>
        {children}
        {submitError && (
          <div className="edit-group-overview-page-success-error-container">
            <ErrorMessage>
              Something went wrong while saving those changes. Please try again.
            </ErrorMessage>
          </div>
        )}
        {successfulSubmit && (
          <div className="edit-group-overview-page-success-error-container">
            <SuccessMessage>
              Your chosen options were successfully saved
            </SuccessMessage>
          </div>
        )}
        <div className="edit-group-display-header-section">
          <h2 className="edit-group-display-sub-title">Header</h2>
          <ListItemContainer>
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <GroupDetailsHeaderSection
              displayType={AVATAR_EMBEDDED_DISPLAY}
              group={groupData}
              groupID={groupID}
              userIsMember={true}
              isMobile={isMobile}
              designOnly={true}
            />
          </ListItemContainer>
          <ListItemContainer>
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <GroupDetailsHeaderSection
              displayType={AVATAR_INTERNAL_DISPLAY}
              group={groupData}
              groupID={groupID}
              userIsMember={true}
              isMobile={isMobile}
              designOnly={true}
            />
          </ListItemContainer>
          <ListItemContainer>
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <GroupDetailsHeaderSection
              displayType={NO_AVATAR_LEFT_TEXT_DISPLAY}
              group={groupData}
              groupID={groupID}
              userIsMember={true}
              isMobile={isMobile}
              designOnly={true}
            />
          </ListItemContainer>
          <ListItemContainer>
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <GroupDetailsHeaderSection
              displayType={NO_AVATAR_CENTER_TEXT_DISPLAY}
              group={groupData}
              groupID={groupID}
              userIsMember={true}
              isMobile={isMobile}
              designOnly={true}
            />
          </ListItemContainer>
        </div>
        <div className="edit-group-display-navigation-section">
          <h2 className="edit-group-display-sub-title">Navigation</h2>
          <div className="edit-group-display-tab-container">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <TabsDisplay
              noBorderOrMargin={true}
              displayType={TAB_RECTANGLES_DISPLAY}
              tabs={exampleTabs.map((tabName, i) => {
                const tabClassName =
                  i === 0 ? 'feed-tab-active' : 'feed-tab-inactive';
                return (
                  <div className={tabClassName} key={tabName}>
                    {tabName}
                  </div>
                );
              })}
            />
          </div>
          <div className="edit-group-display-tab-container">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <TabsDisplay
              noBorderOrMargin={true}
              displayType={TAB_DOUBLE_LINE_DIVIDER_DISPLAY}
              tabs={exampleTabs.map((tabName, i) => {
                const tabClassName =
                  i === 0 ? 'feed-tab-active' : 'feed-tab-inactive';
                return (
                  <div className={tabClassName} key={tabName}>
                    {tabName}
                  </div>
                );
              })}
            />
          </div>
          <div className="edit-group-display-tab-container">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <TabsDisplay
              noBorderOrMargin={true}
              displayType={TAB_NO_DIVIDER_DISPLAY}
              tabs={exampleTabs.map((tabName, i) => {
                const tabClassName =
                  i === 0 ? 'feed-tab-active' : 'feed-tab-inactive';
                return (
                  <div className={tabClassName} key={tabName}>
                    {tabName}
                  </div>
                );
              })}
            />
          </div>
          <div className="edit-group-display-tab-container">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
            </div>
            <TabsDisplay
              noBorderOrMargin={true}
              displayType={TAB_DROPDOWN_DISPLAY}
              tabs={exampleTabs.map((tabName, i) => {
                const tabClassName =
                  i === 0 ? 'feed-tab-active' : 'feed-tab-inactive';
                return (
                  <div className={tabClassName} key={tabName}>
                    {tabName}
                  </div>
                );
              })}
            />
          </div>
        </div>
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

      {isDisplayingContentInPreview ? (
        <div className="edit-group-display-preview-positioning-sizing">
          <div
            className={
              darkOrLightBackground === 'dark'
                ? 'edit-group-display-preview-background-dark'
                : 'light'
            }
          >
            <div className="background-container-preview">
              {backgroundDesignIDToSVG(
                backgroundColorBlindNameAndShadeToID(
                  displayedBackgroundDesign,
                  darkOrLightBackground
                )
              )}
            </div>
            <div className="edit-group-preview-layout">
              <div
                className={`edit-group-preview-sider-left${
                  darkOrLightBackground === 'dark' ? '-dark' : ''
                }`}
              ></div>
              <div className="edit-group-preview-content">
                <div className="edit-group-preview-group-header-section">
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
              </div>
              <div
                className={`edit-group-preview-sider-right${
                  darkOrLightBackground === 'dark' ? '-dark' : ''
                }`}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{height: '900px'}}>
          <div style={{position: 'relative'}}>
            <div className="background-container-preview">
              {backgroundDesignIDToSVG(
                backgroundColorBlindNameAndShadeToID(
                  displayedBackgroundDesign,
                  darkOrLightBackground
                )
              )}
            </div>
          </div>
        </div>
      )}
      {/* {changesMade && (
        <SaveOrCancelPopover
          submitting={submitting}
          onCancel={resetDisplayOptions}
          onSave={submitChanges}
        />
      )} */}
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
