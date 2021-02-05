import * as functions from 'firebase-functions';
import {admin} from './config';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const storage = admin.storage();

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
    throw Error('error when freeing up local memory during image resize');
  }

  return uploadPromise;
});
