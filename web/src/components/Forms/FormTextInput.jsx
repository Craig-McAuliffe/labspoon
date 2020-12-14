import React from 'react';
import {useField} from 'formik';
import InputError from './InputError';

import './FormTextInput.css';

export default function FormTextInput({
  label,
  passwordInput,
  sideLabel,
  placeholder,
  ...props
}) {
  const [field, meta] = useField(props);
  let error;
  if (meta.touched && meta.error) error = <InputError error={meta.error} />;
  return (
    <TextInput
      error={error}
      field={field}
      label={label}
      placeholder={placeholder}
      passwordInput={passwordInput}
      sideLabel={sideLabel}
      {...props}
    />
  );
}

export function TextInput({
  error,
  field,
  label,
  passwordInput,
  sideLabel,
  placeholder,
  ...props
}) {
  return (
    <div
      className={
        sideLabel
          ? 'form-text-input-container-side-label'
          : 'form-text-input-container'
      }
    >
      <label htmlFor={props.name} className="form-input-label">
        <h4>{label}</h4>
      </label>
      <input
        className="form-text-input"
        type={passwordInput ? 'password' : 'text'}
        {...field}
        {...props}
        placeholder={placeholder}
      />
      <div className="error-container">{error}</div>
    </div>
  );
}

export function CreatePostTextArea({...props}) {
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

export function FormTextArea({height, label, bigLabel, ...props}) {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.name} className="form-input-label">
        {bigLabel ? <h3>{label}</h3> : <h4>{label}</h4>}
      </label>
      <textarea
        className="form-text-area"
        {...field}
        {...props}
        style={{height: height}}
      />
      <div className="error-container">
        {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
      </div>
    </>
  );
}
