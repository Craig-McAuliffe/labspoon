import React from 'react';
import {useField} from 'formik';
import InputError from './InputError';

import './FormTextInput.css';

export default function FormTextInput({label, ...props}) {
  const [field, meta] = useField(props);
  return (
    <div className="form-text-input-container">
      <label htmlFor={props.name}>{label}</label>
      <input className="form-text-input" type="text" {...field} {...props} />
      {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
    </div>
  );
}
