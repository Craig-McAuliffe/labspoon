import * as functions from 'firebase-functions';
import {admin} from './config';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const storage = admin.storage();

// Generates a thumbnail for a large image using the image magick library. Takes a cloud storage file path, and saves the output image as destinationFileName in the same directory as the input image. options is an array of image magick convert options.
export const resizeImage = functions.https.onCall(async (data) => {
  const filePath = data.filePath;
  console.log('data', data);
  console.log('filepath', data.filepath);
  const resizeOptions = data.resizeOptions;
  const tmpfileName = `thumbnail`;
  const tmp = path.join(os.tmpdir(), tmpfileName);
  const file = storage.bucket().file(filePath);
  await file
    .download({destination: tmp})
    .catch((err) => {
      console.error(err);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while downloading the unformatted image.'
      );
    })
    .then(() =>
      console.log(
        'downloaded successfully. Does it exist? ' + file.exists(),
        ' downloaded to ',
        tmp
      )
    );
  const [metadata] = await file.getMetadata();
  console.log('metadata', metadata);
  if (!metadata) {
    console.error('no meta data for fetched file from storage');
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while resizing the image.'
    );
  }
  // convert to thumbnail
  resizeOptions.unshift(tmp);
  resizeOptions.push(tmp);
  console.log('resizeOptions', resizeOptions);
  const test = await spawn('convert', resizeOptions)
    .then(() => {
      console.log('spawn was successful');
      return true;
    })
    .catch((err: any) => {
      console.error('spawn was unsuccessful', err);
      return false;
    });
  if (!test)
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while resizing the image.'
    );
  // upload thumbnail
  const uploadPromise = storage
    .bucket()
    .upload(tmp, {
      destination: filePath,
      metadata: {
        contentType: metadata.contentType,
      },
    })
    .then(() => console.log('uploaded resized file'))
    .catch((err) => {
      console.error(err);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while resizing the image.'
      );
    });
  // free up disk space
  fs.unlinkSync(tmp);

  return Promise.resolve(uploadPromise);
});
