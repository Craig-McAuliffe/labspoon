import React, {useState, useEffect} from 'react';
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

const NOT_STARTED = 0;
const UPLOADING = 1;
const FINISHED = 2;

const imageResize = firebase.functions().httpsCallable('images-resizeImage');
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
            setUnsuccessfulUploadCount
          );
        }
      );
      if (uploadingCount === 0) {
        if (unsuccessfulUploadCount === 0) setDisplaySuccessMessage(true);
        else setDisplayErrorMessage(true);
      }
    });
  }

  function onSuccessfulStorageUpload(
    photoStorageRef,
    photoID,
    resizeOptions,
    filePath,
    setUnsuccessfulUploadCount
  ) {
    photoStorageRef
      .getDownloadURL()
      .then(async (url) => {
        if (resizeOptions) {
          await imageResize({
            filePath: filePath,
            resizeOptions: resizeOptions,
          })
            .catch((err) => {
              console.error(
                'an error occurred while calling the resize functions',
                err
              );
              setUnsuccessfulUploadCount((count) => count + 1);
              photoStorageRef
                .delete()
                .catch((err) =>
                  console.error(
                    'could not delete cloud file for ref' + photoStorageRef,
                    err
                  )
                );
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
      .catch((err) =>
        console.error(
          'failed to get download url for ' +
            photoStorageRef +
            ', therefore cannot update db',
          err
        )
      );
  }

  function cancel() {
    setFiles([]);
  }

  if (files.length === 0)
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

  return (
    <>
      <ImagePreviews
        urls={imageURLs}
        uploading={uploading === UPLOADING}
        cover={cover}
      />
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

export function SelectImages({onChange, multipleImages}) {
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
          <h4>Choose image{multipleImages ? 's' : ''}</h4>
          <input
            type="file"
            onChange={validatedOnChange}
            multiple={multipleImages}
            name="uploaded-image"
          />
        </label>
      </div>
      {displayValidationMessage && <UploadValidationMessage />}
    </>
  );
}

export function ImagePreviews({urls, uploading, cover}) {
  if (cover)
    return (
      <div className="image-upload-cover-preview-container">
        {urls.map((url, i) => (
          <UserCoverPhoto
            src={urls[0]}
            alt={`photo from source ${url}`}
            spinner={uploading}
            key={url + i}
          />
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

function UploadValidationMessage() {
  return <ErrorMessage>You can only upload images here.</ErrorMessage>;
}
