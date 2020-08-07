import React from 'react';
import PropTypes from 'prop-types';

/**
 * Filter menu that allows the users to refine what is displayed in the feed
 * or search results. Must be used within a feed or search component that is
 * responsible for managing the state of the filter options.
 * @param {Array} options - an array of option collections that can be used in
 * filtering, such as people
 * @param {func} filterOptionsDispatch - update the status of an option
 * @return {React.ReactElement}
 */
export function FilterMenu({options, updateFilterOption}) {
  const filterCollections = options.map((optionCollection, index) =>
    <FilterCollection
      key={optionCollection.collectionName}
      index={index}
      name={optionCollection.collectionName}
      options={optionCollection.options}
      updateFilterOption={updateFilterOption}
    />,
  );
  return (
    <div>
      {filterCollections}
    </div>
  );
}
FilterMenu.propTypes = {
  options: PropTypes.array.isRequired,
  filterOptionsDispatch: PropTypes.func.isRequired,
};

/**
 * A collection of selectable filter options with a heading describing the collection
 * @param {string} name - name of the collection
 * @param {array} options - list of options in this collection
 * @param {func} filterOptionsDispatch - update the status of an option
 * @return {React.ReactElement} - a collection of filter options
 */
function FilterCollection({name, options, index, updateFilterOption}) {
  /**
   * Callback used for updating the enabled status of an option within this
   * filter collection.
   * @param {Number} optionIndex - index of the option within this filter collection
   * @param {Boolean} state - new enabled status
  */
  function updateFilterCollectionOption(optionIndex) {
    updateFilterOption(index, optionIndex);
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
          setOption={updateFilterCollectionOption}
        />)}
    </div>
  );
}
FilterCollection.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  filterOptionsDispatch: PropTypes.func.isRequired,
};

/**
 * A single selectable filter option
 * @param {Object} data - data to be displayed relating to the option (eg. name)
 * @param {Number} index - index of the option within its filter collection
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
        <input type="checkbox" onChange={()=>setOption(index)}/>
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
 * Gets the IDs of the enabled options in a filter collection.
 * @param {Object} filterCollection - filter collection of the structure specified in
 * FeedPage
 * @return {Set}
*/
export function getFilterCollectionEnabledIDsSet(filterCollection) {
  const enabledIDs = filterCollection.options.filter(
      (option) => option.enabled).map((option) => option.data.id,
  );
  const enabledIDsSet = new Set(enabledIDs);
  return enabledIDsSet;
}
