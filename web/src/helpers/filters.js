// Returns the ID of the first active tab in the filter, defaults to undefined
// when zero tabs are selected. If multiple tabs are selected uses the first.
export function getActiveTabID(filterOptions) {
  let activeTab;
  if (filterOptions.length === 0) {
    activeTab = undefined;
  } else {
    const activeTabObj = filterOptions[0].options.filter(
      (filterOption) => filterOption.enabled === true
    )[0];
    if (activeTabObj === undefined) {
      activeTab = undefined;
    } else {
      activeTab = activeTabObj.data.id;
    }
  }
  return activeTab;
}
