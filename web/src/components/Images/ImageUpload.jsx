import React, {useState, useEffect} from 'react';
import firebase, {storage} from '../../firebase';
import {v4 as uuid} from 'uuid';
import {AddButton} from '../../assets/GeneralActionIcons';
import PrimaryButton from '../Buttons/PrimaryButton';
import NegativeButton from '../Buttons/NegativeButton';
import ImageListItem from '../Media/ImageListItem';
import SuccessMessage from '../Forms/SuccessMessage';
import ErrorMessage from '../Forms/ErrorMessage';

const NOT_STARTED = 0;
const UPLOADING = 1;
const FINISHED = 2;

const MAX_IMAGE_PREVIEWS = 3;

export default function ImageUpload({storageDir, successCallback, refresh}) {
  const [files, setFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [uploading, setUploading] = useState(NOT_STARTED);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [displayValidationMessage, setDisplayValidationMessage] = useState(
    false
  );
  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
  function onChange(e) {
    setFiles(Array.from(e.target.files));
  }

  useEffect(() => {
    if (files.length !== 0) {
      setDisplaySuccessMessage(false);
      setDisplayValidationMessage(false);
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
    const anyNonImages = files.filter(
      (file) => file.type.split('/')[0] !== 'image'
    );
    setUploadingCount(files.length);
    if (anyNonImages.length !== 0) {
      setDisplayValidationMessage(true);
      cancel();
      return;
    }
    files.forEach((file) => {
      const photoID = uuid();
      const photoStorageRef = storage.ref(storageDir + '/' + photoID);
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
            .then((url) => successCallback(url, photoID));
          setUploadingCount((count) => count - 1);
        }
      );
    });
  }

  function cancel() {
    setFiles([]);
  }

  const imagePreviews = imageURLs
    .slice(0, MAX_IMAGE_PREVIEWS)
    .map((imageURL, idx) => (
      <ImageListItem
        src={imageURL}
        key={idx}
        spinner={uploading === UPLOADING ? true : false}
      />
    ));

  if (files.length === 0)
    return (
      <div className="image-upload-section">
        <div className="image-upload-container">
          <label className="image-upload-label">
            <AddButton />
            <h4>Choose files</h4>
            <input
              type="file"
              onChange={onChange}
              multiple
              name="uploaded-image"
            />
          </label>
        </div>
        <div className="after-upload-message-container">
          {displaySuccessMessage ? <UploadSuccessMessage /> : <></>}
          {displayErrorMessage ? <UploadErrorMessage /> : <></>}
          {displayValidationMessage ? <UploadValidationMessage /> : <></>}
        </div>
      </div>
    );

  return (
    <div className="image-upload">
      <div className="image-upload-previews">{imagePreviews}</div>
      <span>
        {imageURLs.length > MAX_IMAGE_PREVIEWS
          ? `+ ${imageURLs.length - MAX_IMAGE_PREVIEWS} more`
          : ''}
      </span>
      <NegativeButton onClick={cancel} disabled={uploading === UPLOADING}>
        Cancel
      </NegativeButton>
      <PrimaryButton onClick={uploadImages} disabled={uploading === UPLOADING}>
        Upload
      </PrimaryButton>
    </div>
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
