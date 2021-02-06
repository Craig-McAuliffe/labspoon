import * as functions from 'firebase-functions';
import {admin} from './config';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const storage = admin.storage();
const db = admin.firestore();

// Generates a thumbnail for a large image using the image magick library. Takes a cloud storage file path, and saves the output image as destinationFileName in the same directory as the input image. options is an array of image magick convert options.
export const resizeImage = functions.https.onCall(async (data, context) => {
  const filePath = data.filePath;
  const resizeOptions = data.resizeOptions;
  const tmpfileName = `thumbnail`;
  const tmp = path.join(os.tmpdir(), tmpfileName);
  const file = storage.bucket().file(filePath);
  await file.download({destination: tmp});
  const [metadata] = await file.getMetadata();
  // convert to thumbnail
  resizeOptions.unshift(tmp);
  resizeOptions.push(tmp);
  await spawn('convert', resizeOptions);
  // upload thumbnail
  const uploadPromise = await storage
    .bucket()
    .upload(tmp, {
      destination: filePath,
      metadata: {
        contentType: metadata.contentType,
        cacheControl: 'no-cache public',
      },
    })
    .catch((err) => {
      console.error(err);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while resizing the image.'
      );
    });
  // free up disk space
  try {
    fs.unlinkSync(tmp);
  } catch {
    console.error('error when freeing up local memory during image resize');
  }

  return uploadPromise;
});

export const resizeImageOnTrigger = functions.storage
  .object()
  .onFinalize(async (object, context) => {
    const filePath = object.name;
    if (!filePath) {
      console.error('storage trigger has no filepath');
      return;
    }
    const fileName = path.basename(filePath);
    if (!fileName.endsWith('_fullSize')) {
      console.log('no resize');
      return;
    }
    const contentType = object.contentType;
    if (!contentType || !contentType.startsWith('image/')) {
      console.error('storage trigger file is not an image.');
      return;
    }

    const splitFilePath = filePath.split('/');
    const resourceCollectionName = splitFilePath[0];
    const resourceID = splitFilePath[1];
    const imageType = splitFilePath[2];

    let resizeOptions;
    if (filePath.includes('users')) {
      if (filePath.includes('avatar'))
        resizeOptions = [
          '-thumbnail',
          '200x200^',
          '-gravity',
          'center',
          '-extent',
          '200x200',
        ];
      else if (filePath.includes('cover'))
        resizeOptions = [
          '-thumbnail',
          '1070x200^',
          '-gravity',
          'center',
          '-extent',
          '1070x200',
        ];
    } else if (filePath.includes('groups') && filePath.includes('avatar'))
      resizeOptions = [
        '-thumbnail',
        '200x200^',
        '-gravity',
        'center',
        '-extent',
        '200x200',
      ];
    if (!resizeOptions) {
      console.error(
        `unable to determine resize option for stored image at path ${filePath}`
      );
      return;
    }
    const storageIDSplit = filePath.split('_');
    if (storageIDSplit.length < 2) {
      console.error(
        `file name does not have correct naming convention, _fullSize, for path ${filePath}`
      );
      return;
    }
    const newFilePath = storageIDSplit[0];
    const newFileID = storageIDSplit[0].split('/')[3];
    if (!resourceCollectionName || !resourceID || !imageType || !newFileID) {
      console.log('file path unsuccessfully deconstructed while resizing');
      return;
    }
    const tmpfileName = `thumbnail`;
    const tmp = path.join(os.tmpdir(), tmpfileName);
    const file = storage.bucket().file(filePath);
    await file.download({destination: tmp});
    const [metadata] = await file.getMetadata();
    // convert to thumbnail
    resizeOptions.unshift(tmp);
    resizeOptions.push(tmp);
    await spawn('convert', resizeOptions);
    // upload thumbnail
    const uploadPromise = await storage
      .bucket()
      .upload(tmp, {
        destination: filePath,
        metadata: {
          contentType: metadata.contentType,
          cacheControl: 'no-cache public',
        },
      })
      .catch((err) => {
        console.error(err);
        throw new functions.https.HttpsError(
          'internal',
          'An error occurred while resizing the image.'
        );
      })
      .then(() => true);
    // free up disk space
    try {
      fs.unlinkSync(tmp);
    } catch {
      console.error('error when freeing up local memory during image resize');
    }
    const resizeSuccess = await Promise.resolve(uploadPromise);
    if (!resizeSuccess) return;
    return db
      .doc(`${resourceCollectionName}/${resourceID}`)
      .update({[imageType]: newFilePath, [imageType + 'CloudID']: newFileID});
  });
