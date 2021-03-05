import React from 'react';

import './SelectCheckBox.css';

export default function SelectCheckBox({
  selectAction,
  selected,
  alreadyPresent,
  isSmallVersion,
}) {
  if (alreadyPresent)
    return (
      <div className="select-checkbox-container">
        <p className="select-checkbox-inactive-text">Already added</p>
      </div>
    );
  const buttonClassName =
    'select-checkbox-button-' +
    (selected ? 'active' : 'inactive') +
    (isSmallVersion ? '-small' : '');
  if (isSmallVersion)
    return <button className={buttonClassName} onClick={selectAction} />;
  return (
    <div className="select-checkbox-container">
      <button className={buttonClassName} onClick={selectAction} />
      <p className="select-checkbox-active-text">Select</p>
    </div>
  );
}

export function setItemSelectedState(
  result,
  willAdd,
  setSelectedItems,
  selectAllResult,
  setAllSelected
) {
  if (willAdd) {
    if (result === selectAllResult) setAllSelected();
    else setSelectedItems((items) => [...items, result]);

    return;
  }
  if (result !== selectAllResult)
    setSelectedItems((items) =>
      items.filter((item) => item !== selectAllResult)
    );
  setSelectedItems((items) => items.filter((item) => item !== result));
}
