import {useField} from 'formik';
import React, {cloneElement} from 'react';
import Dropdown from '../../Dropdown';
import InputError from '../InputError';

import './Select.css';
// currently only supports text options
export default function Select({required, children, ...props}) {
  const [field, meta, helpers] = useField(props);

  let error;
  if (meta.touched && meta.error && required)
    error = <InputError error={meta.error} />;

  const optionsText = new Map();
  const selectChildren = React.Children.map(children, (child) => {
    optionsText.set(child.props.value, child.props.text);
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        onSelect: () => helpers.setValue(child.props.value),
        children: child.props.text,
      });
    }
  });

  return (
    <>
      <Dropdown customToggleTextOnly={optionsText.get(field.value)}>
        {selectChildren}
      </Dropdown>
      {error}
    </>
  );
}

export function LabelledDropdownContainer({label, children}) {
  return (
    <div className="select-dropdown-positioning">
      <h4 className="select-dropdown-label">{label}</h4>
      <div className="select-dropdown-container">{children}</div>
    </div>
  );
}
