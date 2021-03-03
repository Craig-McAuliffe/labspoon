import React, {useState, useEffect, useContext} from 'react';
import {getActiveTabID} from '../../helpers/filters';
import PrimaryButton from '../Buttons/PrimaryButton';
import FilterableResults, {
  FilterableResultsContext,
  FilterManager,
  NewFilterMenuWrapper,
  ResourceTabs,
} from '../FilterableResults/FilterableResults';
import {SelectableResults} from '../Results/Results';
import {UnpaddedPageContainer} from '../Layout/Content';

import './FilteredSelector.css';

export const ADD = 'add';
export const REMOVE = 'remove';

export default function FilteredSelector({
  fetchItems,
  getDefaultFilter,
  children,
  addSelected,
  removeSelected,
  customEndMessage,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [success, setSuccess] = useState(false);
  const [fetchResults, setFetchResults] = useState(() => []);
  // Deselect posts when successfully adding posts
  useEffect(() => {
    if (success) {
      setSelectedItems([]);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  }, [success]);

  useEffect(() => {
    if (!success) return;
    const fetchingResultsFunction = (skip, limit, filter, last) =>
      fetchItems(skip, limit, filter, last);
    setFetchResults(() => fetchingResultsFunction);
  }, [success]);

  const resetSelection = () => {
    setSelectedItems([]);
  };

  return (
    <FilterableResults fetchResults={fetchResults} limit={10}>
      <ResetOnTabSwitch
        resetSelection={resetSelection}
        setSuccess={setSuccess}
      />
      <FilterManager>
        <Sider getDefaultFilter={getDefaultFilter} />
        <UnpaddedPageContainer>
          {children}
          <ResourceTabs tabs={tabs} affectsFilter={true} />
          <SelectionConfirmation
            resetSelection={resetSelection}
            count={selectedItems.length}
            submitAdd={() =>
              addSelected(selectedItems, resetSelection, setSuccess)
            }
            submitRemove={() =>
              removeSelected(selectedItems, resetSelection, setSuccess)
            }
          />
          {success ? <SuccessMessage /> : <></>}
          <SelectableResults
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            customEndMessage={customEndMessage}
          />
        </UnpaddedPageContainer>
      </FilterManager>
    </FilterableResults>
  );
}

const tabs = [
  {
    collectionName: 'Add or Remove',
    options: [
      {
        enabled: false,
        data: {
          id: ADD,
          name: 'Add',
        },
      },
      {
        enabled: false,
        data: {
          id: REMOVE,
          name: 'Remove',
        },
      },
    ],
    mutable: false,
  },
];

function SuccessMessage() {
  return (
    <div className="onboarding-success-overlay-container">
      <div className="success-overlay">
        <h3>Success!</h3>
      </div>
    </div>
  );
}

function SelectionConfirmation({
  resetSelection,
  count,
  submitAdd,
  submitRemove,
}) {
  const filterableResults = useContext(FilterableResultsContext);
  const filter = filterableResults.filter;
  const action = filter ? getActiveTabID(filter) : undefined;

  if (count === 0) return <></>;
  if (action === undefined) return <></>;

  let message;
  let buttonText;
  let onClick;
  if (action === ADD) {
    message = `Add ${count} selected items`;
    buttonText = 'Add';
    onClick = submitAdd;
  } else if (action === REMOVE) {
    message = `Remove ${count} selected items`;
    buttonText = 'Remove';
    onClick = submitRemove;
  } else {
    return <></>;
  }

  return (
    <div className="edit-group-posts-selected-posts-container">
      <h2>{message}</h2>
      <div className="edit-group-posts-selected-posts-actions">
        <button onClick={resetSelection}>Deselect All</button>
        <PrimaryButton onClick={onClick}>{buttonText}</PrimaryButton>
      </div>
    </div>
  );
}

function Sider({getDefaultFilter}) {
  return (
    <NewFilterMenuWrapper
      getDefaultFilter={getDefaultFilter}
      radio={true}
      dependentOnTab={true}
    />
  );
}

function ResetOnTabSwitch({resetSelection, setSuccess}) {
  const filterableResults = useContext(FilterableResultsContext);
  const filters = filterableResults.filter;
  const tabFilter = filters ? filters[0] : undefined;
  // Resets selection if user switches between member or tabs
  useEffect(() => {
    if (filters) {
      const activeTabID = getActiveTabID(filters);
      if (activeTabID) {
        resetSelection();
        setSuccess(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFilter, setSuccess]);
  return null;
}
