import React, {useContext, useEffect} from 'react';
import {useField} from 'formik';
import InputError from './InputError';
import {CreatePostTitleContext} from '../Posts/Post/CreatePost/PostForm';

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
  disabled,
  ...props
}) {
  let containerClassName = 'form-text-input-container';
  if (sideLabel) containerClassName = containerClassName + '-side-label';
  if (!label) containerClassName = containerClassName + '-no-label';
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={props.name}
          className={`form-input-label${disabled ? '-disabled' : ''}`}
        >
          <h4>{label}</h4>
        </label>
      )}
      <input
        className={`form-text-input${disabled ? '-disabled' : ''}`}
        type={passwordInput ? 'password' : 'text'}
        {...field}
        {...props}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error}
    </div>
  );
}

export function CreatePostTextArea({...props}) {
  const [field, meta] = useField(props);
  const {setTitleLength} = useContext(CreatePostTitleContext);

  useEffect(() => setTitleLength(field.value.length), [field.value.length]);

  return (
    <>
      <textarea
        className="create-post-main-text"
        autoFocus
        placeholder="...What's happening?"
        {...field}
        {...props}
      />
      {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
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
      {meta.touched && meta.error ? <InputError error={meta.error} /> : null}
    </>
  );
}
