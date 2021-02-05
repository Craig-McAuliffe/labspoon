import React, {useState, useEffect, useRef} from 'react';
import firebase, {storage} from '../../firebase';
import {v4 as uuid} from 'uuid';
import {AddButton} from '../../assets/GeneralActionIcons';
import PrimaryButton from '../Buttons/PrimaryButton';
import NegativeButton from '../Buttons/NegativeButton';
import {formatTaggedImages, ImagesSection} from './ImageListItem';
import SuccessMessage from '../Forms/SuccessMessage';
import ErrorMessage from '../Forms/ErrorMessage';
import UserCoverPhoto from '../User/UserCoverPhoto';
import './ImageUpload.css';
import {AddProfilePhoto} from '../../assets/CreateGroupIcons';

const NOT_STARTED = 0;
const UPLOADING = 1;
const FINISHED = 2;
const NONIMAGE = 'nonImage';
const TOOBIG = 'tooBig';

const resizeImage = firebase.functions().httpsCallable('images-resizeImage');

export default function ImageUpload({
  storageDir,
  updateDB,
  refresh,
  multipleImages,
  cover,
  resizeOptions,
}) {
  const [files, setFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [uploading, setUploading] = useState(NOT_STARTED);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
  const [unsuccessfulUploadCount, setUnsuccessfulUploadCount] = useState(0);

  function onChange(e) {
    setFiles(Array.from(e.target.files));
  }

  useEffect(() => {
    if (files.length !== 0) {
      setDisplaySuccessMessage(false);
      setDisplayErrorMessage(false);
    }

    setImageURLs(files.map((file) => URL.createObjectURL(file)));
    if (setUploading) setUploading(NOT_STARTED);

    return () => {
      imageURLs.map((url) => URL.revokeObjectURL(url));
      setImageURLs([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, setDisplayErrorMessage, setDisplaySuccessMessage]);

  useEffect(() => {
    if (uploading === FINISHED) {
      setFiles([]);
      if (refresh) refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploading, setImageURLs, setFiles]);

  useEffect(() => {
    if (uploadingCount === 0 && uploading === UPLOADING) setUploading(FINISHED);
  }, [uploadingCount, uploading, setUploading]);

  function uploadImages() {
    setUploading(UPLOADING);
    setUnsuccessfulUploadCount(0);
    setUploadingCount(files.length);

    files.forEach(async (file) => {
      setUploadingCount((count) => count - 1);
      const photoID = uuid();
      const filePath = storageDir + '/' + photoID;
      const photoStorageRef = storage.ref(filePath);
      photoStorageRef.put(file, {contentType: file.type}).on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (err) => {
          console.error(err);
          setUnsuccessfulUploadCount((count) => count + 1);
        },
        () => {
          onSuccessfulStorageUpload(
            photoStorageRef,
            photoID,
            resizeOptions,
            filePath,
            setUnsuccessfulUploadCount,
            updateDB
          );
        }
      );
      if (uploadingCount === 0) {
        if (unsuccessfulUploadCount === 0) setDisplaySuccessMessage(true);
        else setDisplayErrorMessage(true);
      }
    });
  }

  function cancel() {
    setFiles([]);
  }
  return imageURLs.length === 0 ? (
    <NoImagesSelected
      onChange={onChange}
      multipleImages={multipleImages}
      displaySuccessMessage={displaySuccessMessage}
      displayErrorMessage={displayErrorMessage}
      unsuccessfulUploadCount={unsuccessfulUploadCount}
    />
  ) : (
    <ImagesSelected
      imageURLs={imageURLs}
      uploading={uploading}
      cover={cover}
      cancel={cancel}
      uploadImages={uploadImages}
    />
  );
}

function onSuccessfulStorageUpload(
  photoStorageRef,
  photoID,
  resizeOptions,
  filePath,
  setUnsuccessfulUploadCount,
  updateDB
) {
  photoStorageRef
    .getDownloadURL()
    .then(async (url) => {
      if (resizeOptions) {
        await resizeImage({
          filePath: filePath,
          resizeOptions: resizeOptions,
        })
          .catch((err) => {
            console.error(
              'an error occurred while calling the resize functions',
              err
            );
            setUnsuccessfulUploadCount((count) => count + 1);
            deleteUploadedFileOnError();
          })
          .then(async () => {
            if (updateDB)
              await updateDB(url, photoID).catch((err) => {
                console.error(err);
                setUnsuccessfulUploadCount((count) => count + 1);
              });
          });
      } else if (updateDB) {
        await updateDB(url, photoID).catch((err) => {
          console.error(err);
          setUnsuccessfulUploadCount((count) => count + 1);
        });
      }
    })
    .catch((err) => {
      console.error(
        'failed to get download url for ' +
          photoStorageRef +
          ', therefore cannot update db',
        err
      );
      deleteUploadedFileOnError();
      setUnsuccessfulUploadCount((count) => count + 1);
    });

  const deleteUploadedFileOnError = () => {
    photoStorageRef
      .delete()
      .catch((err) =>
        console.error(
          'could not delete cloud file for ref' + photoStorageRef,
          err
        )
      );
  };
}

function NoImagesSelected({
  onChange,
  multipleImages,
  displaySuccessMessage,
  displayErrorMessage,
  unsuccessfulUploadCount,
}) {
  return (
    <div className="image-upload-section">
      <SelectImages onChange={onChange} multipleImages={multipleImages} />
      <div className="after-upload-message-container">
        {displaySuccessMessage ? <UploadSuccessMessage /> : <></>}
        {displayErrorMessage ? (
          <UploadErrorMessage count={unsuccessfulUploadCount} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

function ImagesSelected({
  imageURLs,
  uploading,
  cover,
  cancel,
  uploadImages,
  isAvatar,
  cancelText,
}) {
  return (
    <>
      <ImagePreviews
        urls={imageURLs}
        uploading={uploading === UPLOADING}
        cover={cover}
        rounded={isAvatar}
      />
      <div className="confirm-cancel-upload-container">
        <NegativeButton onClick={cancel} disabled={uploading === UPLOADING}>
          {cancelText ? cancelText : 'Cancel'}
        </NegativeButton>
        {uploadImages && (
          <PrimaryButton
            onClick={uploadImages}
            disabled={uploading === UPLOADING}
          >
            Upload
          </PrimaryButton>
        )}
      </div>
    </>
  );
}
const MAX_IMAGE_PREVIEWS = 3;

export function SelectImages({onChange, multipleImages}) {
  const [displayValidationMessage, setDisplayValidationMessage] = useState(
    false
  );
  return (
    <>
      <div className="image-upload-container">
        <label className="image-upload-label">
          <AddButton />
          <h4>Choose image{multipleImages ? 's' : ''}</h4>
          <input
            type="file"
            onChange={(e) =>
              validatedOnChange(e, onChange, setDisplayValidationMessage)
            }
            multiple={multipleImages}
            name="uploaded-image"
          />
        </label>
      </div>
      {displayValidationMessage === NONIMAGE && <UploadTypeValidationMessage />}
      {displayValidationMessage === TOOBIG && <UploadSizeValidationMessage />}
    </>
  );
}

export function SelectAvatar({existingAvatar, onChange}) {
  const [displayValidationMessage, setDisplayValidationMessage] = useState(
    false
  );
  const selectFileInputRef = useRef();
  return (
    <div>
      <input
        type="file"
        onChange={(e) =>
          validatedOnChange(e, onChange, setDisplayValidationMessage)
        }
        name="uploaded-image"
        multiple={false}
        ref={selectFileInputRef}
        style={{display: 'none'}}
      />
      <button
        className="image-upload-avatar-button"
        onClick={() => selectFileInputRef.current.click()}
        type="button"
        label="upload images"
      >
        {existingAvatar ? (
          <div className="image-upload-avatar-container">
            <div className="image-upload-rounded-preview-container">
              <img src={existingAvatar} alt="avatar" />
            </div>
            <AddButton />
            <h3>Upload New Photo</h3>
          </div>
        ) : (
          <div className="image-upload-no-avatar-container">
            <AddProfilePhoto />
          </div>
        )}
      </button>
      {displayValidationMessage === NONIMAGE && <UploadTypeValidationMessage />}
      {displayValidationMessage === TOOBIG && <UploadSizeValidationMessage />}
    </div>
  );
}

export function ImagePreviews({urls, uploading, cover, rounded}) {
  if (cover)
    return (
      <div className="image-upload-cover-preview-container">
        {urls.map((url, i) => (
          <UserCoverPhoto
            src={urls[0]}
            alt="cover for user"
            spinner={uploading}
            key={url + i}
          />
        ))}
      </div>
    );

  if (rounded)
    return (
      <div>
        {urls.map((url, i) => (
          <div key={url + i} className="image-upload-rounded-preview-container">
            <img src={url} alt="avatar" />
          </div>
        ))}
      </div>
    );
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

function UploadErrorMessage({count}) {
  if (count)
    return (
      <ErrorMessage>
        Something went wrong uploading {count} of your images.
      </ErrorMessage>
    );
  return (
    <ErrorMessage>Something went wrong. Please try again later.</ErrorMessage>
  );
}

function UploadTypeValidationMessage() {
  return <ErrorMessage>You can only upload images here.</ErrorMessage>;
}

function UploadSizeValidationMessage() {
  return <ErrorMessage>Images must be less than 15MB</ErrorMessage>;
}

function validatedOnChange(e, onChange, setDisplayValidationMessage) {
  setDisplayValidationMessage(false);
  const files = Array.from(e.target.files);
  const nonOrInvalidImages = files.filter(
    (file) => file.type.split('/')[0] !== 'image'
  );
  if (nonOrInvalidImages.length !== 0) {
    setDisplayValidationMessage(NONIMAGE);
    return;
  }
  const tooBigImages = files.filter((file) => file.size >= 15000000);
  if (tooBigImages.length !== 0) {
    setDisplayValidationMessage(TOOBIG);
    return;
  }
  return onChange(e);
}
