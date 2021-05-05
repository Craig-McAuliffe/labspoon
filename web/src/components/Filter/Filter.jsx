import React, {useContext, useState, useRef, useEffect} from 'react';
import {FiltersIcon, SearchIconGrey} from '../../assets/HeaderIcons';
import {FeatureFlags} from '../../App';
import withSizes from 'react-sizes';
import './Filter.css';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import {FilterManagerContext} from '../FilterableResults/FilterableResults';
import OnHoverPopover from '../Popovers/OnHoverPopover';
import {getEnabledIDsFromFilter} from '../../helpers/filters';
import {POST} from '../../helpers/resourceTypeDefinitions';
import {getPaginatedResourcesFromCollectionRef} from '../../helpers/resources';

export const FILTER_OPTIONS_LIMIT = 10;
export const FETCH_MORE_FILTER_OPTIONS_LIMIT = 30;

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
        <p className="filter-title">FILTER</p>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreOptionNoFetch, setShowMoreOptionNoFetch] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState([]);

  function updateFilterCollectionOption(optionIndex) {
    updateFilterOption(index, optionIndex);
  }
  // this is required in case of resize and therefore filter component change
  useEffect(() => {
    if (options.length > FILTER_OPTIONS_LIMIT && !showMoreOptionNoFetch)
      setShowMoreOptionNoFetch(true);
  }, []);
  useEffect(() => {
    if (isExpanded) return setDisplayedOptions(options);
    return setDisplayedOptions(options.slice(0, FILTER_OPTIONS_LIMIT));
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
          cutOffLength={isExpanded ? 20 : 25}
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

export async function fetchMoreOptionsFromFilterCollection(
  filterOptionsCollectionRef,
  last
) {
  const newOptionsFetchPromise = await filterOptionsCollectionRef
    .orderBy('rank', 'desc')
    .orderBy('name')
    .orderBy('id')
    .startAfter(last.data.rank, last.data.name, last.data.id)
    .limit(FETCH_MORE_FILTER_OPTIONS_LIMIT + 1)
    .get()
    .catch((err) =>
      console.error(`unable to fetch more filter options ${err}`)
    );
  if (!newOptionsFetchPromise) return [];
  const newFilterOptions = [];
  newOptionsFetchPromise.forEach((optionDS) => {
    const optionData = optionDS.data();

    newFilterOptions.push({
      data: {
        id: optionDS.id,
        name: optionData.name,
        rank: optionData.rank,
      },
      enabled: false,
    });
  });
  return {
    newOptions: newFilterOptions,
    hasMore: newOptionsFetchPromise.size > FETCH_MORE_FILTER_OPTIONS_LIMIT,
  };
}

export function getFiltersFromFilterCollection(filterCollectionsQS) {
  if (!filterCollectionsQS) return [];
  const filterCollections = [];
  filterCollectionsQS.forEach((filterCollectionDoc) => {
    const filterCollectionData = filterCollectionDoc.data();
    const filterOptionsPromise = filterCollectionDoc.ref
      .collection('filterOptions')
      .orderBy('rank', 'desc')
      .orderBy('name')
      .orderBy('id')
      .limit(FILTER_OPTIONS_LIMIT + 1)
      .get()
      .then((qs) => {
        const filterCollection = {
          collectionName: filterCollectionData.resourceName,
          collectionType: filterCollectionData.resourceType,
          options: [],
          mutable: true,
          hasMore: qs.size > FILTER_OPTIONS_LIMIT,
        };
        qs.forEach((doc) => {
          const filterOptionData = doc.data();
          if (filterOptionData.id === 'defaultPost') return;
          filterCollection.options.push({
            data: {
              id: filterOptionData.id,
              name: filterOptionData.name,
              rank: filterOptionData.rank,
            },
            enabled: false,
          });
        });
        if (filterCollection.hasMore) filterCollection.options.pop();
        return filterCollection;
      })
      .catch((err) => console.log('filter err', err));
    filterCollections.push(filterOptionsPromise);
  });
  return Promise.all(filterCollections);
}

// Due to the limitations in firestore filters described in
// https://firebase.google.com/docs/firestore/query-data/queries it is not
// possible to use multiple many-to-many filters (ie. `array-contains-any` and
// `in`).
const arrayContainsAnyErrorMessage =
  'You cannot select multiple filters in separate sections. Try deselecting the last option.';

export function filterFeedData(collection, skip, limit, filter, last) {
  const enabledIDs = getEnabledIDsFromFilter(filter);
  if (enabledIDs.size !== 0) {
    // No more than one array-contains-any condition may be used in a single compound query.
    let arrayContainsAnyCount = 0;
    const enabledAuthorIDs = enabledIDs.get('Author');
    const enabledPostTypeIDs = enabledIDs.get('Post Type');
    if (enabledPostTypeIDs && enabledPostTypeIDs.length === 1) {
      collection = collection.where('postType.id', '==', enabledPostTypeIDs[0]);
    }
    if (enabledPostTypeIDs && enabledPostTypeIDs.length > 1) {
      arrayContainsAnyCount++;
      collection = collection.where('postType.id', 'in', enabledPostTypeIDs);
    }

    if (enabledAuthorIDs && enabledAuthorIDs.length === 1) {
      collection = collection.where('author.id', '==', enabledAuthorIDs[0]);
    }
    if (enabledAuthorIDs && enabledAuthorIDs.length > 1) {
      arrayContainsAnyCount++;
      if (arrayContainsAnyCount > 1)
        return [undefined, arrayContainsAnyErrorMessage];
      collection = collection.where('author.id', 'in', enabledAuthorIDs);
    }

    const enabledTopicIDs = enabledIDs.get('Topics');
    if (enabledTopicIDs !== undefined) {
      if (enabledTopicIDs.length === 1) {
        collection = collection.where(
          'filterTopicIDs',
          'array-contains',
          enabledTopicIDs[0]
        );
      }
      if (enabledTopicIDs.length > 1) {
        arrayContainsAnyCount++;
        if (arrayContainsAnyCount > 1)
          return [undefined, arrayContainsAnyErrorMessage];
        collection = collection.where(
          'filterTopicIDs',
          'array-contains-any',
          enabledTopicIDs
        );
      }
    }
  }

  return [
    getPaginatedResourcesFromCollectionRef(collection, limit, last, POST),
    undefined,
  ];
}
