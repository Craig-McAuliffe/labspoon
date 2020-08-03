import React from 'react';
import PropTypes from 'prop-types';

/**
 * Filter menu that allows the users to refine what is displayed in the feed
 * or search results. Must be used within a feed or search component that is
 * responsible for managing the state of the filter options.
 * @param {Array} options - an array of option groups that can be used in
 * filtering, such as people
 * @param {func} filterOptionsDispatch - dispatch an action to update the
 * filter state
 * @return {React.ReactElement}
 */
export function FilterMenu({options, filterOptionsDispatch}) {
  const filterGroups = options.map((optionGroup, index) =>
    <FilterGroup
      key={optionGroup.groupName}
      index={index}
      name={optionGroup.groupName}
      options={optionGroup.options}
      filterOptionsDispatch={filterOptionsDispatch}
    />,
  );
  return (
    <div>
      {filterGroups}
    </div>
  );
}
FilterMenu.propTypes = {
  options: PropTypes.array.isRequired,
  filterOptionsDispatch: PropTypes.func.isRequired,
};

/**
 * A group of selectable filter options with a heading describing the group
 * @param {string} name - name of the group
 * @param {array} options - list of options in this group
 * @param {func} filterOptionsDispatch - dispatch an action to update the
 * filter state
 * @return {React.ReactElement} - a group of filter options
 */
function FilterGroup({name, options, index, filterOptionsDispatch}) {
  /**
   * Callback used for updating the enabled status of an option within this
   * filter group.
   * @param {Number} optionIndex - index of the option within this filter group
   * @param {Boolean} state - new enabled status
  */
  function updateFilterGroupOptions(optionIndex, state) {
    filterOptionsDispatch({
      state: state,
      groupIndex: index,
      optionIndex: optionIndex,
    });
  }
  return (
    <div>
      <b>{name}</b>
      {options.map((option, index) =>
        <FilterOption
          key={name}
          index={index}
          data={option.data}
          enabled={option.enabled}
          setOption={updateFilterGroupOptions}
        />)}
    </div>
  );
}
FilterGroup.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  filterOptionsDispatch: PropTypes.func.isRequired,
};

/**
 * A single selectable filter option
 * @param {Object} data - data to be displayed relating to the option (eg. name)
 * @param {Number} index - index of the option within its filter group
 * @param {Boolean} enabled - whether the filter is currently enabled
 * @param {Function} setOption - function that sets whether the option is
 * enabled
 * @return {React.ReactElement} - a filter option
 */
function FilterOption({data, index, enabled, setOption}) {
  return (
    <div>
      <label>
        {data.name}
        <input type="checkbox" onChange={()=>setOption(index, !enabled)}/>
      </label>
    </div>
  );
}
FilterOption.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
  setOption: PropTypes.func.isRequired,
};

/**
 * Gets the IDs of the enabled options in a filter group.
 * @param {Object} filterGroup - filter group of the structure specified in
 * FeedPage
 * @return {Set}
*/
export function getFilterGroupEnabledIDsSet(filterGroup) {
  const enabledIDs = filterGroup.options.filter(
      (option) => option.enabled).map((option) => option.data.id,
  );
  const enabledIDsSet = new Set(enabledIDs);
  return enabledIDsSet;
}