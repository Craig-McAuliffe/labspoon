import React from 'react';
import {useField} from 'formik';
import InputError from './InputError';

import './FormDateInput.css';
export default function FormDateInput({label, sideLabel, ...props}) {
  const [field, meta] = useField(props);
  return (
    <div
      className={
        sideLabel
          ? 'form-date-input-container-side-label'
          : 'form-date-input-container'
      }
    >
      <label htmlFor={props.name}>{label}</label>
      <input className="form-date-input" type="date" {...field} {...props} />
      {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
    </div>
  );
}
