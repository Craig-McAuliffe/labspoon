import React, {useState, useEffect} from 'react';
import {useField} from 'formik';
import {ImagePreviews, SelectImages} from '../Images/ImageUpload';
import NegativeButton from '../Buttons/NegativeButton';

import './FormImageUpload.css';
export default function FormImageUpload({...props}) {
  const [field, , helpers] = useField(props);
  const [urls, setURLs] = useState([]);
  const imageFiles = field.value;

  useEffect(() => {
    if (!imageFiles) return;
    setURLs(Array.from(imageFiles).map((file) => URL.createObjectURL(file)));
    return () => {
      urls.map((url) => URL.revokeObjectURL(url));
      setURLs([]);
    };
  }, [imageFiles]);

  function onChange(e) {
    helpers.setValue(e.target.files);
  }

  if (!imageFiles || imageFiles.length === 0) {
    return <SelectImages onChange={onChange} />;
  }

  return (
    <>
      <ImagePreviews urls={urls} />
      <div className="form-image-cancel-container">
        <NegativeButton onClick={() => helpers.setValue([])}>
          Remove
        </NegativeButton>
      </div>
    </>
  );
}
