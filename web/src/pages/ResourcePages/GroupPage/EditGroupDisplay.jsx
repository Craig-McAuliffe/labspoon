import React, {useState} from 'react';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {ListItemContainer} from '../../../components/ListItem/ListItemCommonComponents';
import withSizes from 'react-sizes';
import {GroupDetailsHeaderSection} from './GroupDetails';

import './EditGroupDisplay.css';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import {TabsDisplay} from '../../../components/FilterableResults/FilterableResults';
import Dropdown, {DropdownOption} from '../../../components/Dropdown';
import NegativeButton from '../../../components/Buttons/NegativeButton';

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

function backgroundDesignIDToName(designID) {
  switch (designID) {
    case BLANK_LIGHT_BACKGROUND:
      return 'DEFAULT LIGHT';
    case SPHERICAL_LIGHT_BACKGROUND:
      return 'SPHERICAL LIGHT';
    case SQUARES_LIGHT_BACKGROUND:
      return 'SQUARES LIGHT';
    case MANDELBROT_LIGHT_BACKGROUND:
      return 'MANDELBROT LIGHT';
    case TOWERS_LIGHT_BACKGROUND:
      return 'TOWERS LIGHT';
    case CYCLES_LIGHT_BACKGROUND:
      return 'CYCLES LIGHT';
    case SINGULARITY_LIGHT_BACKGROUND:
      return 'SINGULARITY LIGHT';
    case BLANK_DARK_BACKGROUND:
      return 'DEFAULT DARK';
    case SPHERICAL_DARK_BACKGROUND:
      return 'SPHERICAL DARK';
    case SQUARES_DARK_BACKGROUND:
      return 'SQUARES DARK';
    case MANDELBROT_DARK_BACKGROUND:
      return 'MANDELBROT DARK';
    case TOWERS_DARK_BACKGROUND:
      return 'TOWERS DARK';
    case CYCLES_DARK_BACKGROUND:
      return 'CYCLES DARK';
    case SINGULARITY_DARK_BACKGROUND:
      return 'SINGULARITY DARK';
  }
}

const colorBlindDesignOptions = [
  'DEFAULT',
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

function EditGroupDisplay({groupData, groupID, children, isMobile}) {
  const [displayedBackgroundDesign, setDisplayedBackgroundDesign] = useState(
    groupData.backgroundDesign
      ? groupData.backgroundDesign
      : BLANK_LIGHT_BACKGROUND
  );
  const [
    isDisplayingContentInPreview,
    setIsDisplayingContentInPreview,
  ] = useState(false);
  return (
    <PaddedPageContainer>
      {children}
      <div className="edit-group-display-header-section">
        <h2 className="edit-group-display-sub-title">Header</h2>
        <ListItemContainer>
          <div className="container-positioning">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
              <GroupDetailsHeaderSection
                displayType={AVATAR_EMBEDDED_DISPLAY}
                group={groupData}
                groupID={groupID}
                userIsMember={true}
                isMobile={isMobile}
                designOnly={true}
              />
            </div>
          </div>
        </ListItemContainer>
        <ListItemContainer>
          <div className="container-positioning">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
              <GroupDetailsHeaderSection
                displayType={AVATAR_INTERNAL_DISPLAY}
                group={groupData}
                groupID={groupID}
                userIsMember={true}
                isMobile={isMobile}
                designOnly={true}
              />
            </div>
          </div>
        </ListItemContainer>
        <ListItemContainer>
          <div className="container-positioning">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
              <GroupDetailsHeaderSection
                displayType={NO_AVATAR_LEFT_TEXT_DISPLAY}
                group={groupData}
                groupID={groupID}
                userIsMember={true}
                isMobile={isMobile}
                designOnly={true}
              />
            </div>
          </div>
        </ListItemContainer>
        <ListItemContainer>
          <div className="container-positioning">
            <div className="edit-group-display-selector-container">
              <SecondaryButton>Select</SecondaryButton>
              <GroupDetailsHeaderSection
                displayType={NO_AVATAR_CENTER_TEXT_DISPLAY}
                group={groupData}
                groupID={groupID}
                userIsMember={true}
                isMobile={isMobile}
                designOnly={true}
              />
            </div>
          </div>
        </ListItemContainer>
      </div>
      <div className="edit-group-display-navigation-section">
        <h2 className="edit-group-display-sub-title">Navigation</h2>
        <div className="edit-group-display-tab-container">
          <TabsDisplay
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
          <TabsDisplay
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
          <TabsDisplay
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
          <TabsDisplay
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
        <Dropdown
          customToggleTextOnly={backgroundDesignIDToName(
            displayedBackgroundDesign
          )}
        >
          {getDesignOptions(setDisplayedBackgroundDesign)}
        </Dropdown>
        <div className="edit-group-display-background-preview-container">
          Here goes the background
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
    </PaddedPageContainer>
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
