import React, {useContext, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {
  FilterManagerContext,
  getActiveTabIDFromTypeFilterCollection,
} from '../FilterableResults/FilterableResults';
import {PaddedContent} from '../Layout/Content';
import {
  TAB_SINGLE_LINE_DIVIDER_DISPLAY,
  TAB_DROPDOWN_DISPLAY,
  TAB_NO_DIVIDER_DISPLAY,
  TAB_RECTANGLES_DISPLAY,
} from '../../pages/ResourcePages/GroupPage/EditGroupDisplay';
import Dropdown from '../Dropdown';

import './Tabs.css';

export default function Tabs({
  tabFilter,
  setTabFilter,
  affectsFilter,
  routedTabBasePathname,
  useRoutedTabs,
  displayType,
}) {
  const filterManager = useContext(FilterManagerContext);
  const selectedTabID = getActiveTabIDFromTypeFilterCollection(tabFilter);

  useEffect(() => {
    if (!tabFilter) return;
    if (selectedTabID === 'default') setTabFilter(tabFilter.options[0].data.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFilter]);
  if (!tabFilter) return <div></div>;
  const tabOptions = tabFilter.options;
  return (
    <TabsDisplay
      affectsFilter={affectsFilter}
      routedTabBasePathname={routedTabBasePathname}
      setSiderFilterLoading={filterManager.setSiderFilterLoading}
      currentTabID={selectedTabID}
      useRoutedTabs={useRoutedTabs}
      tabOptions={tabOptions}
      displayType={displayType}
    />
  );
}

function RoutedTabOption({
  displayType,
  tabOption,
  currentTabID,
  routedTabBasePathname,
}) {
  const className = getClassNameFromDisplayType(displayType);
  return (
    <Link
      to={`/${routedTabBasePathname}/${tabOption.data.id}`}
      key={tabOption.data.id}
      className={`${className}${
        tabOption.data.id === currentTabID ? '-active' : '-inactive'
      }`}
    >
      <h3>{tabOption.data.name}</h3>
    </Link>
  );
}

function NonRoutedTabOption({
  displayType,
  onSelect,
  affectsFilter,
  tabID,
  tabName,
  currentTabID,
  setSiderFilterLoading,
  index,
}) {
  const className = getClassNameFromDisplayType(displayType);
  const onTabSelect = () => {
    if (!tabID) return;
    if (tabID === selectedTabID) return;
    // If the filter changes on tab change, we should not fetch results
    // until the new filter is loaded
    if (affectsFilter) {
      setSiderFilterLoading(true);
    }
    setTabFilter(tabID);
  };
  return (
    <button
      onClick={() => {
        if (onSelect) onSelect();
        onTabSelect();
      }}
      key={tabID ? tabID : index}
      className={`${className}${
        tabID === currentTabID || index === 0 ? '-active' : '-inactive'
      }`}
    >
      <h3>{tabName}</h3>
    </button>
  );
}

function getClassNameFromDisplayType(displayType) {
  let className = 'feed-tab';
  switch (displayType) {
    case TAB_RECTANGLES_DISPLAY: {
      className = className + '-rectangles';
      break;
    }
    case TAB_SINGLE_LINE_DIVIDER_DISPLAY: {
      className = className + '-single-divider';
      break;
    }
    case TAB_NO_DIVIDER_DISPLAY: {
      className = className + '-no-divider';
      break;
    }
    case TAB_DROPDOWN_DISPLAY: {
      className = className + '-dropdown';
      break;
    }
    default: {
      className = className + '-rectangles';
      break;
    }
  }
  return className;
}

export function TabsDisplay({
  useRoutedTabs,
  tabNamesOnly,
  currentTabID,
  affectsFilter,
  noBorderOrMargin,
  displayType,
  tabOptions,
  routedTabBasePathname,
  setSiderFilterLoading,
}) {
  if (displayType === TAB_DROPDOWN_DISPLAY)
    return (
      <PaddedContent>
        <Dropdown
          customToggleTextOnly={
            tabNamesOnly
              ? tabNamesOnly[0]
              : tabOptions.filter(
                  (tabOption) => tabOption.id === currentTabID
                )[0].name
          }
        >
          <TabDropdownOptions
            onSelect={() => {}}
            useRoutedTabs={useRoutedTabs}
            tabNamesOnly={tabNamesOnly}
            currentTabID={currentTabID}
            affectsFilter={affectsFilter}
            noBorderOrMargin={noBorderOrMargin}
            displayType={displayType}
            tabOptions={tabOptions}
            routedTabBasePathname={routedTabBasePathname}
            setSiderFilterLoading={setSiderFilterLoading}
          />
        </Dropdown>
      </PaddedContent>
    );
  const tabsToBeMapped = tabNamesOnly ? tabNamesOnly : tabOptions;
  return (
    <PaddedContent>
      <div
        className={`feed-tabs-container${
          noBorderOrMargin ? '-no-border-or-padding' : ''
        }`}
      >
        <div className="feed-tabs-layout">
          {tabsToBeMapped.map((option, i) => {
            return useRoutedTabs && option.data.id !== currentTabID ? (
              <RoutedTabOption
                routedTabBasePathname={routedTabBasePathname}
                tabOption={option}
                currentTabID={currentTabID}
                displayType={displayType}
              />
            ) : (
              <NonRoutedTabOption
                displayType={displayType}
                affectsFilter={affectsFilter}
                setSiderFilterLoading={setSiderFilterLoading}
                tabOption={option}
                currentTabID={currentTabID}
                tabName={tabNamesOnly ? option : option.data.name}
                tabID={tabNamesOnly ? null : option.data.id}
                index={i}
              />
            );
          })}
        </div>
      </div>
    </PaddedContent>
  );
}

function TabDropdownOptions({
  useRoutedTabs,
  onSelect,
  currentTabID,
  affectsFilter,
  tabOptions,
  tabNamesOnly,
  routedTabBasePathname,
  setSiderFilterLoading,
}) {
  const tabsToBeMapped = tabNamesOnly ? tabNamesOnly : tabOptions;
  if (useRoutedTabs && !tabNamesOnly)
    return tabOptions.map((tabOption) => (
      <RoutedTabOption
        tabNamesOnly={tabNamesOnly}
        displayType={TAB_DROPDOWN_DISPLAY}
        key={tabOption.id}
        routedTabBasePathname={routedTabBasePathname}
        tabOption={tabOption}
        currentTabID={currentTabID}
      />
    ));
  return tabsToBeMapped.map((tabOption, i) => (
    <NonRoutedTabOption
      displayType={TAB_DROPDOWN_DISPLAY}
      variant="dropdown"
      key={tabNamesOnly ? i : tabOption.id}
      onSelect={onSelect}
      affectsFilter={affectsFilter}
      setSiderFilterLoading={setSiderFilterLoading}
      currentTabID={currentTabID}
      tabName={tabNamesOnly ? tabOption : tabOption.data.name}
      tabID={tabNamesOnly ? null : tabOption.data.id}
      index={i}
    />
  ));
}
