import React, {useState, useEffect} from 'react';
import firebase, {storage} from '../../firebase';
import {v4 as uuid} from 'uuid';
import {AddButton} from '../../assets/GeneralActionIcons';
import PrimaryButton from '../Buttons/PrimaryButton';
import NegativeButton from '../Buttons/NegativeButton';
import {formatTaggedImages, ImagesSection} from '../Media/ImageListItem';
import SuccessMessage from '../Forms/SuccessMessage';
import ErrorMessage from '../Forms/ErrorMessage';
import './ImageUpload.css';

const NOT_STARTED = 0;
const UPLOADING = 1;
const FINISHED = 2;

export default function ImageUpload({storageDir, successCallback, refresh}) {
  const [files, setFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [uploading, setUploading] = useState(NOT_STARTED);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);

  function onChange(e) {
    setFiles(Array.from(e.target.files));
  }

  useEffect(() => {
    if (files.length !== 0) {
      setDisplaySuccessMessage(false);
      setDisplayErrorMessage(false);
    }
    setImageURLs(files.map((file) => URL.createObjectURL(file)));
    setUploading(NOT_STARTED);
    return () => {
      imageURLs.map((url) => URL.revokeObjectURL(url));
      setImageURLs([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, setImageURLs, setUploading]);

  useEffect(() => {
    if (uploading === FINISHED) {
      setFiles([]);
      setDisplaySuccessMessage(true);
      if (refresh) refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploading, setImageURLs, setFiles]);

  useEffect(() => {
    if (uploadingCount === 0 && uploading === UPLOADING) setUploading(FINISHED);
  }, [uploadingCount, uploading, setUploading]);

  function uploadImages() {
    setUploading(UPLOADING);
    files.forEach((file) => {
      const photoID = uuid();
      const photoStorageRef = storage.ref(storageDir + '/' + photoID);
      setUploadingCount((count) => count + 1);
      photoStorageRef.put(file, {contentType: file.type}).on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (err) => {
          console.error(err);
          setDisplayErrorMessage(true);
        },
        () => {
          photoStorageRef
            .getDownloadURL()
            .then((url) => successCallback(url, photoID))
            .then(() => setUploadingCount((count) => count - 1));
        }
      );
    });
  }

  function cancel() {
    setFiles([]);
  }

  if (files.length === 0)
    return (
      <div className="image-upload-section">
        <SelectImages onChange={onChange} />
        <div className="after-upload-message-container">
          {displaySuccessMessage ? <UploadSuccessMessage /> : <></>}
          {displayErrorMessage ? <UploadErrorMessage /> : <></>}
        </div>
      </div>
    );

  return (
    <>
      <ImagePreviews urls={imageURLs} uploading={uploading === UPLOADING} />
      <div className="confirm-cancel-upload-container">
        <NegativeButton onClick={cancel} disabled={uploading === UPLOADING}>
          Cancel
        </NegativeButton>
        <PrimaryButton
          onClick={uploadImages}
          disabled={uploading === UPLOADING}
        >
          Upload
        </PrimaryButton>
      </div>
    </>
  );
}

const MAX_IMAGE_PREVIEWS = 3;

export function SelectImages({onChange}) {
  const [displayValidationMessage, setDisplayValidationMessage] = useState(
    false
  );
  function validatedOnChange(e) {
    setDisplayValidationMessage(false);
    const files = Array.from(e.target.files);
    const anyNonImages = files.filter(
      (file) => file.type.split('/')[0] !== 'image'
    );
    if (anyNonImages.length !== 0) {
      setDisplayValidationMessage(true);
      return;
    }
    return onChange(e);
  }

  return (
    <>
      <div className="image-upload-container">
        <label className="image-upload-label">
          <AddButton />
          <h4>Choose images</h4>
          <input
            type="file"
            onChange={validatedOnChange}
            multiple
            name="uploaded-image"
          />
        </label>
      </div>
      {displayValidationMessage && <UploadValidationMessage />}
    </>
  );
}

export function ImagePreviews({urls, uploading}) {
  return (
    <>
      <ImagesSection
        images={formatTaggedImages(urls.slice(0, MAX_IMAGE_PREVIEWS))}
        spinner={uploading}
      />
      <p className="image-previews-overflow">
        {urls.length > MAX_IMAGE_PREVIEWS
          ? `+ ${urls.length - MAX_IMAGE_PREVIEWS} more`
          : ''}
      </p>
    </>
  );
}

function UploadSuccessMessage() {
  return <SuccessMessage>Photos successfully uploaded.</SuccessMessage>;
}

function UploadErrorMessage() {
  return (
    <ErrorMessage>Something went wrong. Please try again later.</ErrorMessage>
  );
}

function UploadValidationMessage() {
  return <ErrorMessage>You can only upload images here.</ErrorMessage>;
}
