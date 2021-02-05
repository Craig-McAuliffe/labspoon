import * as functions from 'firebase-functions';
// import {admin} from './config';
// const spawn = require('child-process-promise').spawn;
// import * as path from 'path';
// import * as os from 'os';
// import * as fs from 'fs';

// const storage = admin.storage();

// Generates a thumbnail for a large image using the image magick library. Takes a cloud storage file path, and saves the output image as destinationFileName in the same directory as the input image. options is an array of image magick convert options.
export const resizeImageOnTrigger = functions.storage
  .object()
  .onFinalize(async (object, context) => {
    console.log('trigger');
    if (!object.name) return;
    console.log(context.params);
    // if (!object.name.includes(AVATAR_FILENAME)) return;
    // if (downloadURL) values.avatar = downloadURL;
    // if (avatarID) values.avatarCloudID = avatarID;
    // const filePath = data.filePath;
    // const tmpfileName = `thumbnail`;
    // const tmp = path.join(os.tmpdir(), tmpfileName);
    // const file = storage.bucket().file(filePath);
    // const resizeOptions = [
    //   '-thumbnail',
    //   '200x200^',
    //   '-gravity',
    //   'center',
    //   '-extent',
    //   '200x200',
    // ];
    // await file
    // .download({destination: tmp})
    // .catch((err) => {
    //   console.error(err);
    //   throw new functions.https.HttpsError(
    //     'internal',
    //     'An error occurred while downloading the unformatted image.'
    //     );
    //   })
    //   .then(async () => {
    //     const fileExists = await Promise.resolve(file.exists());
    //     console.log(
    //       'downloaded successfully. Does it exist? ' + fileExists,
    //       ' downloaded to ',
    //       tmp
    //       );
    //     });
    //     const [metadata] = await file.getMetadata();
    //     if (!metadata) {
    //       console.error('no meta data for fetched file from storage');
    //       throw new functions.https.HttpsError(
    //         'internal',
    //         'An error occurred while resizing the image.'
    //         );
    //       }
    //       // convert to thumbnail
    //       resizeOptions.unshift(tmp);
    //       resizeOptions.push(tmp);
    //       await spawn('convert', resizeOptions);
    //       // upload thumbnail
    //       const uploadPromise = storage
    //       .bucket()
    //       .upload(tmp, {
    //         destination: filePath,
    //         metadata: {
    //           contentType: metadata.contentType,
    //         },
    //       })
    //       .then(() => console.log('uploaded resized file'))
    //       .catch((err) => {
    //         console.error(err);
    //         throw new functions.https.HttpsError(
    //           'internal',
    //           'An error occurred while resizing the image.'
    //           );
    //         });
    //         // free up disk space
    //         fs.unlinkSync(tmp);

    //         return Promise.resolve(uploadPromise);
  });
