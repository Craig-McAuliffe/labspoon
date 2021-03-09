import React, {useContext, useState, useRef, useEffect} from 'react';
import {FiltersIcon, SearchIconGrey} from '../../assets/HeaderIcons';
import {FeatureFlags} from '../../App';
import withSizes from 'react-sizes';
import './Filter.css';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import {FilterManagerContext} from '../FilterableResults/FilterableResults';
import OnHoverPopover from '../Popovers/OnHoverPopover';

function FilterMenu({
  filterCollectionsWithOptions,
  updateFilterOption,
  resetFilterCollection,
  radio,
  isMobile,
}) {
  const filterCollections = filterCollectionsWithOptions.map(
    (optionCollection, index) => {
      if (!optionCollection.mutable) return null;
      return (
        <FilterCollection
          key={optionCollection.collectionName}
          index={index}
          collectionName={optionCollection.collectionName}
          collectionType={optionCollection.collectionType}
          options={optionCollection.options}
          updateFilterOption={updateFilterOption}
          resetFilterCollection={resetFilterCollection}
          radio={radio}
          collectionHasMore={optionCollection.hasMore}
        />
      );
    }
  );
  if (isMobile) return <MobileFilter filterCollections={filterCollections} />;

  return (
    <div className="sider-layout">
      <div className="filter-container">
        <FilterSearch />
        {filterCollections}
      </div>
    </div>
  );
}

const mapSizesToPropsForFilter = ({width}) => ({
  isMobile: width && width <= 1197,
});

export default withSizes(mapSizesToPropsForFilter)(FilterMenu);

function FilterCollection({
  collectionName,
  collectionType,
  collectionHasMore,
  options,
  index,
  updateFilterOption,
  resetFilterCollection,
  radio,
}) {
  const {siderFilterOptionsLimit} = useContext(FilterManagerContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreOptionNoFetch, setShowMoreOptionNoFetch] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState([]);

  function updateFilterCollectionOption(optionIndex) {
    updateFilterOption(index, optionIndex);
  }

  useEffect(() => {
    if (options.length > siderFilterOptionsLimit && !showMoreOptionNoFetch)
      setShowMoreOptionNoFetch(true);
  }, []);
  useEffect(() => {
    if (isExpanded) return setDisplayedOptions(options);
    return setDisplayedOptions(options.slice(0, siderFilterOptionsLimit));
  }, [isExpanded, options]);
  return (
    <div className="filter-collection">
      <div className="filter-collection-header">
        <h3 className="filter-collection-title">{collectionName}</h3>
        {radio === undefined ? (
          <button
            onClick={() => resetFilterCollection(index)}
            className="filter-collection-reset"
          >
            Clear
          </button>
        ) : null}
      </div>
      {displayedOptions.map((option, index) => (
        <FilterOption
          key={collectionName + option.data.id}
          index={index}
          data={option.data}
          enabled={option.enabled}
          setOption={updateFilterCollectionOption}
          radio={radio}
          isExpanded={isExpanded}
        />
      ))}
      {(collectionHasMore || showMoreOptionNoFetch) && (
        <FilterShowMoreOrFewerButton
          moreOrFewer="more"
          collectionType={collectionType}
          collectionIndex={index}
          last={options[options.length - 1]}
          setIsExpanded={setIsExpanded}
          showMoreOptionNoFetch={showMoreOptionNoFetch}
          setShowMoreOptionNoFetch={setShowMoreOptionNoFetch}
        />
      )}
      {isExpanded && (
        <FilterShowMoreOrFewerButton
          moreOrFewer="fewer"
          setIsExpanded={setIsExpanded}
          setShowMoreOptionNoFetch={setShowMoreOptionNoFetch}
        />
      )}
    </div>
  );
}

function FilterShowMoreOrFewerButton({
  moreOrFewer,
  collectionType,
  collectionIndex,
  last,
  setIsExpanded,
  setShowMoreOptionNoFetch,
  showMoreOptionNoFetch,
}) {
  const {fetchMoreSiderFilter} = useContext(FilterManagerContext);
  if (moreOrFewer === 'more')
    return (
      <div className="filter-options-pagination-container">
        <button
          onClick={() => {
            if (!showMoreOptionNoFetch)
              fetchMoreSiderFilter(collectionIndex, collectionType, last);
            setIsExpanded(true);
            setShowMoreOptionNoFetch(false);
          }}
          className="filter-option-pagination-button"
        >
          Show more
        </button>
      </div>
    );

  return (
    <div className="filter-options-pagination-container">
      <button
        onClick={() => {
          setIsExpanded(false);
          setShowMoreOptionNoFetch(true);
        }}
        className="filter-option-pagination-button"
      >
        Show fewer
      </button>
    </div>
  );
}

function FilterOption({data, index, enabled, setOption, radio, isExpanded}) {
  return (
    <div className={`filter-option-container`}>
      <OnHoverPopover popoverText={data.name} left="0px" top="100%">
        <FilterOptionName
          name={data.name}
          setIsHovering={() => {}}
          cutOffLength={isExpanded ? 22 : 28}
        />
      </OnHoverPopover>
      <label className="filter-checkbox-container">
        <input
          type={radio === undefined ? 'checkbox' : 'radio'}
          name={data.name}
          id={`fitlerOption ${data.name}`}
          checked={enabled}
          onChange={() => setOption(index)}
          className={radio === undefined ? 'filter-checkbox' : 'filter-radio'}
        />
        <span
          className={
            radio === undefined
              ? 'filter-checkbox-design'
              : 'filter-radio-design'
          }
        ></span>
      </label>
    </div>
  );
}

function FilterOptionName({name, setIsHovering, cutOffLength}) {
  return (
    <p
      className="filter-option-name"
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {name.slice(0, cutOffLength)}
      {name.length > cutOffLength && '...'}
    </p>
  );
}

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

function MobileFilter({filterCollections}) {
  const [mobileFilterIsOpen, setMobileFilterIsOpen] = useState(false);
  const mobileFilterRef = useRef();

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (mobileFilterRef.current) {
        if (!mobileFilterRef.current.contains(e.target))
          setMobileFilterIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  if (mobileFilterIsOpen)
    return (
      <div className="mobile-sider-layout" ref={mobileFilterRef}>
        <div className="hide-filter-buttons-container">
          <button
            className="mobile-filter-button-active"
            onClick={() => setMobileFilterIsOpen(false)}
          >
            <FiltersIcon />
            <h4>Filters</h4>
          </button>
          <button
            className="remove-icon-button"
            onClick={() => setMobileFilterIsOpen(false)}
          >
            <RemoveIcon />
          </button>
        </div>
        <div className="filter-container">
          <FilterSearch />
          {filterCollections}
        </div>
      </div>
    );
  return (
    <button
      className="mobile-filter-button"
      onClick={() => setMobileFilterIsOpen(true)}
    >
      <FiltersIcon />
      <h4>Filters</h4>
    </button>
  );
}
