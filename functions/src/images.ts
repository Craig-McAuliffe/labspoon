import * as functions from 'firebase-functions';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {admin, ResourceTypesCollections} from './config';
import * as adminNS from 'firebase-admin';

const storage = admin.storage();
const db = admin.firestore();

export const resizeImageOnTrigger = functions
  .runWith({timeoutSeconds: 60, memory: '1GB'})
  .storage.object()
  .onFinalize(async (object, context) => {
    const filePath: string | undefined = object.name;
    if (!filePath) {
      console.error('storage trigger has no filepath');
      return;
    }
    const fileName = path.basename(filePath);
    if (!fileName.endsWith('_fullSize')) {
      return;
    }
    const contentType = object.contentType;
    if (!contentType || !contentType.startsWith('image/')) {
      console.error('storage trigger file is not an image.');
      return;
    }

    const storageIDSplit = filePath.split('_');
    if (storageIDSplit.length !== 2) {
      console.error(
        `file name does not have correct naming convention, _fullSize, for path ${filePath}`
      );
      return;
    }
    const resizeOptions: Array<string> | undefined = getResizeOptions(filePath);
    if (!resizeOptions) {
      console.error(
        `unable to determine resize option for stored image at path ${filePath}`
      );
      return;
    }
    if (filePath.split('_').length !== 2) {
      console.log('resize failed as naming convention _ is incorrect.');
      return;
    }

    const filePathNoFullSizeTag = filePath.split('_')[0];
    const splitFilePathNoFullSizeTag: Array<string> = filePathNoFullSizeTag.split(
      '/'
    );
    const oldFileID = filePath.split('/')[
      splitFilePathNoFullSizeTag.length - 1
    ];
    const newFileID =
      splitFilePathNoFullSizeTag[splitFilePathNoFullSizeTag.length - 1];
    console.log('newFileID' + newFileID);
    console.log(`old file id ${oldFileID}`);
    if (splitFilePathNoFullSizeTag.length < 4) {
      console.error(
        `unable to resize image with filePath ${filePath} as the filePath is too short`
      );
      return;
    }

    const firestoreDocumentDetails:
      | PhotoRefDetails
      | undefined = getFirestorePathandUpdateType(
      filePathNoFullSizeTag,
      newFileID,
      splitFilePathNoFullSizeTag
    );
    if (
      !firestoreDocumentDetails ||
      !firestoreDocumentDetails.firestoreDocPath
    ) {
      console.error(`unable to properly deconstruct the pathname ${filePath}`);
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
    // upload resized image
    const uploadPromise = await storage
      .bucket()
      .upload(tmp, {
        destination: filePathNoFullSizeTag,
        metadata: {
          contentType: metadata.contentType,
          cacheControl: 'no-cache public',
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
    switch (firestoreDocumentDetails.updateType) {
      case 'updateField':
        return Promise.resolve(
          db
            .doc(firestoreDocumentDetails.firestoreDocPath)
            .update({
              [firestoreDocumentDetails.fieldName!]: resizePublicURL,
              [`${firestoreDocumentDetails.fieldName!}CloudID`]: newFileID,
            })
            .catch((err) =>
              console.error(
                `unable to update ${firestoreDocumentDetails.fieldName} at ${firestoreDocumentDetails.firestoreDocPath} for photo with id ${newFileID} ${err}`
              )
            )
        );
      case 'updateArray':
        return Promise.resolve(
          db
            .doc(firestoreDocumentDetails.firestoreDocPath)
            .update({
              [firestoreDocumentDetails.fieldName!]: adminNS.firestore.FieldValue.arrayUnion(
                resizePublicURL
              ),
            })
            .catch((err) =>
              console.error(
                `unable to add photo with id ${newFileID} to ${firestoreDocumentDetails.firestoreDocPath} ${err}`
              )
            )
        );
      case 'newDoc':
        return Promise.resolve(
          db
            .doc(firestoreDocumentDetails.firestoreDocPath)
            .set({src: resizePublicURL, timestamp: new Date()})
            .catch((err) =>
              console.error(
                `unable to add photo with id ${newFileID} to ${firestoreDocumentDetails.firestoreDocPath} ${err}`
              )
            )
        );
    }
  });

function getResizeOptions(filePath: string) {
  if (filePath.includes('users')) {
    if (filePath.includes('avatar'))
      return [
        '-thumbnail',
        '200x200^',
        '-gravity',
        'center',
        '-extent',
        '200x200',
      ];
    if (filePath.includes('cover'))
      return [
        '-thumbnail',
        '1070x200^',
        '-gravity',
        'center',
        '-extent',
        '1070x200',
      ];
  }
  if (filePath.includes('groups')) {
    if (filePath.includes('avatar'))
      return [
        '-thumbnail',
        '200x200^',
        '-gravity',
        'center',
        '-extent',
        '200x200',
      ];
    if (filePath.includes(ResourceTypesCollections.RESEARCH_FOCUSES))
      return [
        '-thumbnail',
        '400x400^',
        '-gravity',
        'center',
        '-extent',
        '400x400',
      ];
    if (filePath.includes(ResourceTypesCollections.TECHNIQUES))
      return [
        '-thumbnail',
        '400x400^',
        '-gravity',
        'center',
        '-extent',
        '400x400',
      ];
  }
  return;
}

function getFirestorePathandUpdateType(
  filePathNoFullSizeTag: string,
  newFileID: string,
  splitFilePathNoFullSizeTag: Array<string>
) {
  const processFilePathForDocUpdate = (): string | undefined => {
    if (splitFilePathNoFullSizeTag.length !== 4) return undefined;
    const collectionAndDocArray = splitFilePathNoFullSizeTag.slice(0, 2);
    collectionAndDocArray.push(newFileID);
    return collectionAndDocArray.join('/');
  };
  if (filePathNoFullSizeTag.length % 2 === 0) {
    if (filePathNoFullSizeTag.includes('avatar'))
      return {
        updateType: 'updateField',
        firestoreDocPath: processFilePathForDocUpdate(),
        fieldName: 'avatar',
      };
    if (filePathNoFullSizeTag.includes('cover'))
      return {
        updateType: 'updateField',
        firestoreDocPath: processFilePathForDocUpdate(),
        fieldName: 'cover',
      };
    return {updateType: 'newDoc', firestoreDocPath: filePathNoFullSizeTag};
  }
  if (
    !filePathNoFullSizeTag.includes(ResourceTypesCollections.TECHNIQUES) &&
    !filePathNoFullSizeTag.includes(ResourceTypesCollections.RESEARCH_FOCUSES)
  )
    return;
  const splitPathCopy = [...splitFilePathNoFullSizeTag];
  splitPathCopy.pop();
  return {
    updateType: 'updateArray',
    firestoreDocPath: splitPathCopy.join('/'),
    fieldName: 'photoURLs',
  };
}

interface PhotoRefDetails {
  updateType: string;
  firestoreDocPath: string | undefined;
  fieldName?: string;
}
