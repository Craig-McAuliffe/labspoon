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
import {AddProfilePhoto} from '../../assets/CreateGroupIcons';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './ImageUpload.css';
import {getDefaultAvatar} from '../../helpers/groups';

const NOT_STARTED = 0;
const UPLOADING = 1;
const FINISHED = 2;
const NONIMAGE = 'nonImage';
const TOOBIG = 'tooBig';
const GIF = 'gif';
const TOOMANY = 'maxImages';

export default function ImageUpload({
  storageDir,
  updateDB,
  refresh,
  multipleImages,
  isCover,
  noGif,
  isAvatar,
  existingAvatar,
  shouldResize,
  maxImages,
}) {
  const [files, setFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [uploading, setUploading] = useState(NOT_STARTED);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, setDisplayErrorMessage, setDisplaySuccessMessage]);

  useEffect(() => {
    setImageURLs(files.map((file) => URL.createObjectURL(file)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, setImageURLs]);

  useEffect(() => {
    return () => {
      imageURLs.map((url) => URL.revokeObjectURL(url));
      setImageURLs([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setImageURLs]);

  useEffect(() => {
    if (uploading === FINISHED) {
      setFiles([]);
      if (refresh) refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploading, setImageURLs, setFiles]);

  async function uploadImages() {
    setUploading(UPLOADING);
    let uploadingCount = files.length;
    let unsuccessfulUploadCount = 0;
    const uploadPromisesArray = [];
    files.forEach(async (file) => {
      uploadingCount = uploadingCount - 1;
      const photoID = uuid() + (shouldResize ? '_fullSize' : '');
      const filePath = storageDir + '/' + photoID;
      const photoStorageRef = storage.ref(filePath);
      uploadPromisesArray.push(
        new Promise((resolve, reject) => {
          photoStorageRef.put(file, {contentType: file.type}).on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            () => {},
            (err) => {
              console.error(err);
              unsuccessfulUploadCount = unsuccessfulUploadCount + 1;
              reject(err);
            },
            async () => {
              await onSuccessfulStorageUpload(
                photoStorageRef,
                photoID,
                unsuccessfulUploadCount,
                updateDB
              );
              if (uploadingCount === 0) {
                if (unsuccessfulUploadCount === 0)
                  setDisplaySuccessMessage(true);
                else setDisplayErrorMessage(true);
              }
              resolve('succeeded');
            }
          );
        })
      );
    });
    await Promise.all(uploadPromisesArray);
    setUploading(FINISHED);
  }

  function cancel() {
    setFiles([]);
    setImageURLs([]);
  }
  return imageURLs.length === 0 ? (
    <NoImagesSelected
      onChange={onChange}
      multipleImages={multipleImages}
      displaySuccessMessage={displaySuccessMessage}
      displayErrorMessage={displayErrorMessage}
      noGif={noGif}
      isAvatar={isAvatar}
      existingAvatar={existingAvatar}
      maxImages={maxImages}
    />
  ) : (
    <ImagesSelected
      imageURLs={imageURLs}
      uploading={uploading}
      isCover={isCover}
      cancel={cancel}
      uploadImages={uploadImages}
      isAvatar={isAvatar}
    />
  );
}

async function onSuccessfulStorageUpload(
  photoStorageRef,
  photoID,
  unsuccessfulUploadCount,
  updateDB
) {
  photoStorageRef
    .getDownloadURL()
    .catch(async (err) => {
      console.error(
        'unable to get download url for ' +
          photoStorageRef +
          ', therefore cannot update db',
        err
      );
      unsuccessfulUploadCount = unsuccessfulUploadCount + 1;
      return deleteUploadedFileOnError();
    })
    .then((downloadURL) => {
      if (!updateDB) return;
      return updateDB(downloadURL, photoID).catch((err) => {
        console.error(err);
        unsuccessfulUploadCount = unsuccessfulUploadCount + 1;
      });
    });
}

const deleteUploadedFileOnError = () =>
  photoStorageRef
    .delete()
    .catch((err) =>
      console.error(
        'could not delete cloud file for ref' + photoStorageRef,
        err
      )
    );

function NoImagesSelected({
  onChange,
  multipleImages,
  displaySuccessMessage,
  displayErrorMessage,
  noGif,
  isAvatar,
  existingAvatar,
  maxImages,
}) {
  let imageSelectionUI;
  if (isAvatar && existingAvatar)
    imageSelectionUI = (
      <SelectAvatar
        existingAvatar={existingAvatar}
        noGif={true}
        onChange={onChange}
      />
    );
  else
    imageSelectionUI = (
      <SelectImages
        onChange={onChange}
        multipleImages={multipleImages}
        noGif={noGif}
        maxImages={maxImages}
      />
    );

  return (
    <div className="image-upload-section">
      {imageSelectionUI}
      <div className="after-upload-message-container">
        {displaySuccessMessage ? <UploadSuccessMessage /> : <></>}
        {displayErrorMessage ? <UploadErrorMessage /> : <></>}
      </div>
    </div>
  );
}

function ImagesSelected({
  imageURLs,
  uploading,
  isCover,
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
        isCover={isCover}
        isAvatar={isAvatar}
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

export function SelectImages({onChange, multipleImages, noGif, maxImages}) {
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
              validatedOnChange(
                e,
                onChange,
                setDisplayValidationMessage,
                noGif,
                maxImages
              )
            }
            multiple={multipleImages}
            name="uploaded-image"
          />
        </label>
      </div>
      <ErrorMessageType
        displayValidationMessage={displayValidationMessage}
        maxImages={maxImages}
      />
    </>
  );
}

function ErrorMessageType({displayValidationMessage, maxImages}) {
  if (displayValidationMessage === NONIMAGE)
    return <UploadTypeValidationMessage />;
  if (displayValidationMessage === GIF) return <NoGifValidationMessage />;
  if (displayValidationMessage === TOOBIG)
    return <UploadSizeValidationMessage />;
  if (displayValidationMessage === TOOMANY)
    return <TooManyValidationMessage maxImages={maxImages} />;
  return null;
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
          validatedOnChange(e, onChange, setDisplayValidationMessage, true)
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
              <img
                src={existingAvatar}
                alt="avatar"
                onError={(img) => (img.target.src = getDefaultAvatar())}
              />
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
      <ErrorMessageType displayValidationMessage={displayValidationMessage} />
    </div>
  );
}

export function ImagePreviews({urls, uploading, isCover, isAvatar}) {
  if (isCover)
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

  if (isAvatar)
    return (
      <div>
        {urls.map((url, i) => (
          <div key={url + i} className="image-upload-rounded-preview-container">
            <img
              src={url}
              alt="avatar"
              className={uploading ? 'avatar-preview-loading' : ''}
            />
            {uploading && (
              <div className="avatar-image-spinner-container">
                <LoadingSpinner />
              </div>
            )}
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
  return (
    <SuccessMessage>
      Success! It can take few seconds for the changes to appear.
    </SuccessMessage>
  );
}

function UploadErrorMessage() {
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

function NoGifValidationMessage() {
  return <ErrorMessage>Avatars cannot be GIFs</ErrorMessage>;
}

function TooManyValidationMessage({maxImages}) {
  return <ErrorMessage>You can only add {maxImages} images.</ErrorMessage>;
}

function validatedOnChange(
  e,
  onChange,
  setDisplayValidationMessage,
  noGif,
  maxImages
) {
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

  if (noGif) {
    const gifImages = files.filter((file) => file.type.split('/')[1] === 'gif');
    if (gifImages.length !== 0) {
      setDisplayValidationMessage(GIF);
      return;
    }
  }
  if (maxImages && files.length > maxImages) {
    setDisplayValidationMessage(TOOMANY);
    return;
  }

  return onChange(e);
}
