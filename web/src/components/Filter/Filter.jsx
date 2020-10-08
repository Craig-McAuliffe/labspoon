import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import {FeatureFlags} from '../../App';
import './Filter.css';

/**
 * Filter menu that allows the users to refine what is displayed in the feed
 * or search results. Must be used within a feed or search component that is
 * responsible for managing the state of the filter options.
 * @param {Array} options - an array of option collections that can be used in
 * filtering, such as people
 * @param {func} updateFilterOption - update the status of an option
 * @param {func} resetFilterCollection - reset the state of a filter collection
 * @return {React.ReactElement}
 */
export function FilterMenu({
  options,
  updateFilterOption,
  resetFilterCollection,
}) {
  const filterCollections = options.map((optionCollection, index) => {
    if (!optionCollection.mutable) return null;
    return (
      <FilterCollection
        key={optionCollection.collectionName}
        index={index}
        name={optionCollection.collectionName}
        options={optionCollection.options}
        updateFilterOption={updateFilterOption}
        resetFilterCollection={resetFilterCollection}
      />
    );
  });

  return (
    <div className="filter-container">
      <FilterSearch />
      {filterCollections}
    </div>
  );
  return null;
}
FilterMenu.propTypes = {
  options: PropTypes.array.isRequired,
  updateFilterOption: PropTypes.func.isRequired,
  resetFilterCollection: PropTypes.func.isRequired,
};

/**
 * A collection of selectable filter options with a heading describing the collection
 * @param {string} name - name of the collection
 * @param {array} options - list of options in this collection
 * @param {func} filterOptionsDispatch - update the status of an option
 * @return {React.ReactElement} - a collection of filter options
 */
function FilterCollection({
  name,
  options,
  index,
  updateFilterOption,
  resetFilterCollection,
}) {
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
    <div className="filter-collection">
      <div className="filter-collection-header">
        <h3 className="filter-collection-title">{name}</h3>
        <button
          onClick={() => resetFilterCollection(index)}
          className="filter-collection-reset"
        >
          Reset
        </button>
      </div>
      {options.map((option, index) => (
        <FilterOption
          key={name + option.data.id}
          index={index}
          data={option.data}
          enabled={option.enabled}
          setOption={updateFilterCollectionOption}
        />
      ))}
    </div>
  );
}
FilterCollection.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
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
    <div className="filter-options-container">
      <div className="filter-option-name">{data.name}</div>
      <label className="filter-checkbox-container">
        <input
          type="checkbox"
          name={data.name}
          id={`fitlerOption ${data.name}`}
          checked={enabled}
          onChange={() => setOption(index)}
          className="filter-checkbox"
        />
        <span className="filter-checkbox-design"></span>
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
  const enabledIDs = filterCollection.options
    .filter((option) => option.enabled)
    .map((option) => option.data.id);
  const enabledIDsSet = new Set(enabledIDs);
  return enabledIDsSet;
}

function FilterSearch() {
  const featureFlags = useContext(FeatureFlags);
  if (featureFlags.has('filter-feed-term'))
    return (
      <div className="filter-search">
        <SearchIconGrey />
        <input type="text" placeholder="Filter Feed By" />
      </div>
    );
  else return null;
}
