import React, {useContext, useEffect} from 'react';
import {useField} from 'formik';
import InputError from './InputError';
import {
  CreatePostCharacterCount,
  CreatePostTitleContext,
} from '../Posts/Post/CreatePost/PostForm';
import {CreatingPostContext} from '../Posts/Post/CreatePost/CreatePost';

import './FormTextInput.css';
import HeaderAndBodyArticleInput from './Articles/HeaderAndBodyArticleInput';

export default function FormTextInput({
  label,
  passwordInput,
  sideLabel,
  placeholder,
  inputRef,
  children,
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
      inputRef={inputRef}
      {...props}
    >
      {children}
    </TextInput>
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
  inputRef,
  attachedComponent,
  children,
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
        ref={inputRef}
      />
      {error}
      {children}
    </div>
  );
}

export function CreatePostTextArea({...props}) {
  const [field] = useField(props);
  const {setTitleLength, titleLength} = useContext(CreatePostTitleContext);
  const {setSavedTitleText} = useContext(CreatingPostContext);
  useEffect(() => {
    const titleLength = field.value.reduce((accumulator, current) => {
      // + 1 is for the paragraph break character itself
      return accumulator + current.children[0].text.length + 1;
    }, 0);
    setTitleLength(titleLength);
    setSavedTitleText(field.value);
  }, [field.value]);

  return (
    <>
      <HeaderAndBodyArticleInput
        noTitle={true}
        className="create-post-main-text"
        {...props}
        customPlaceholderText="...What's happening?"
        shouldAutoFocus={true}
      />
      <CreatePostCharacterCount count={titleLength} />
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
