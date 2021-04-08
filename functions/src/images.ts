import * as functions from 'firebase-functions';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {admin} from './config';
import {checkUserIsMemberOfGroup} from './helpers';

const storage = admin.storage();

export const resizeImageOnCall = functions
  .runWith({timeoutSeconds: 60, memory: '1GB'})
  .https.onCall(async (data, context) => {
    const filePath: string = data.filePath;
    if (!filePath) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide filepath'
      );
    }
    const fileName = path.basename(filePath);
    if (!fileName.endsWith('_fullSize')) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Filepath must end with _fullSize'
      );
    }

    const resizeOptions: Array<string> = data.resizeOptions;
    if (!resizeOptions) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide resize options'
      );
    }
    if (!context.auth || !context.auth.uid)
      throw new functions.https.HttpsError(
        'permission-denied',
        'User must be signed in to resize image'
      );
    const userID = context.auth.uid;
    if (filePath.includes('user') && !filePath.includes(userID)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User is trying to resize image for a different user'
      );
    }
    const groupID = data.groupID;
    if (filePath.includes('group')) {
      if (!groupID) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Must provide group ID to resize group image'
        );
      }
      if (!checkUserIsMemberOfGroup(userID, groupID)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'User is not permitted to modify this group'
        );
      }
    }

    const storageFileNameSplit = filePath.split('_');
    if (storageFileNameSplit.length !== 2) {
      console.error(
        `file name does not have correct naming convention, _fullSize, for path ${filePath}`
      );
      return;
    }

    const filePathNoFullSizeTag = filePath.split('_')[0];
    const tmpfileName = `thumbnail`;
    const tmp = path.join(os.tmpdir(), tmpfileName);
    const file = storage.bucket().file(filePath);
    await file.download({destination: tmp});
    const [metadata] = await file.getMetadata();
    if (!metadata.contentType || !metadata.contentType.startsWith('image/')) {
      console.error('uploaded file for resize is not an image');
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The uploaded file is not an image.'
      );
    }
    // convert to thumbnail
    resizeOptions.unshift(tmp);
    resizeOptions.push(tmp);
    await spawn('convert', resizeOptions).catch(() => {
      console.error('an error occurred while spawn converting the image ');
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while resizing the image.'
      );
    });
    // upload resized image
    const uploadPromise = await storage
      .bucket()
      .upload(tmp, {
        destination: filePathNoFullSizeTag,
        metadata: {
          contentType: metadata.contentType,
        },
      })
      .catch((err) => {
        console.error(
          `unable to upload resized image to path ${filePathNoFullSizeTag}, ${err}`
        );
        throw new functions.https.HttpsError(
          'internal',
          'An error occurred while resizing the image.'
        );
      })
      .then(async (resp) => {
        await resp[0].makePublic();
        return resp[0].publicUrl();
      });
    // free up disk space
    try {
      fs.unlinkSync(tmp);
    } catch {
      console.error('error when freeing up local memory during image resize');
    }
    const resizePublicURL = await Promise.resolve(uploadPromise);
    if (!resizePublicURL) return;
    console.log(resizePublicURL);
    return resizePublicURL;
  });
