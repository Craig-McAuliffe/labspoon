import React, {useState, useEffect} from 'react';
import {useField} from 'formik';
import {ImagePreviews, SelectImages, SelectAvatar} from './ImageUpload';
import NegativeButton from '../Buttons/NegativeButton';

import './FormImageUpload.css';

export default function FormImageUpload({
  isAvatar,
  multiple,
  existingAvatar,
  maxImages,
  ...props
}) {
  const [field, , helpers] = useField(props);
  const [urls, setURLs] = useState([]);
  const imageFiles = field.value;

  useEffect(() => {
    if (!imageFiles) return;
    setURLs(Array.from(imageFiles).map((file) => URL.createObjectURL(file)));
    return () =>
      setURLs((urls) => {
        urls.map((url) => URL.revokeObjectURL(url));
        return [];
      });
  }, [imageFiles]);

  function onChange(e) {
    helpers.setValue(e.target.files);
  }

  if (!imageFiles || imageFiles.length === 0) {
    if (isAvatar)
      return (
        <SelectAvatar onChange={onChange} existingAvatar={existingAvatar} />
      );
    return (
      <SelectImages
        onChange={onChange}
        multipleImages={multiple}
        maxImages={maxImages}
      />
    );
  }

  return (
    <>
      <ImagePreviews urls={urls} isAvatar={isAvatar} />
      <div className="form-image-cancel-container">
        <NegativeButton onClick={() => helpers.setValue([])}>
          Remove
        </NegativeButton>
      </div>
    </>
  );
}
