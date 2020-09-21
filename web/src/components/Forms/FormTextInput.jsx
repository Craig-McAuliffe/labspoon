import React from 'react';
import {useField} from 'formik';
import InputError from './InputError';

import './FormTextInput.css';

export default function FormTextInput({
  label,
  passwordInput,
  sideLabel,
  ...props
}) {
  const [field, meta] = useField(props);
  return (
    <div
      className={
        sideLabel
          ? 'form-text-input-container-side-label'
          : 'form-text-input-container'
      }
    >
      <label htmlFor={props.name}>{label}</label>
      <input
        className="form-text-input"
        type={passwordInput ? 'password' : 'text'}
        {...field}
        {...props}
      />
      <div className="error-container">
        {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
      </div>
    </div>
  );
}

export function FormTextArea({...props}) {
  const [field, meta] = useField(props);
  return (
    <>
      <textarea
        className="create-post-main-text"
        autoFocus
        placeholder="...What's happening?"
        {...field}
        {...props}
      />
      <div className="error-container">
        {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
      </div>
    </>
  );
}
