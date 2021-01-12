import {admin} from '../config';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const storage = admin.storage();

// Generates a thumbnail for a large image using the image magick library. Takes a cloud storage file path, and saves the output image as destinationFileName in the same directory as the input image. options is an array of image magick convert options.
export async function generateThumbnail(
  originalPath: string,
  options: string[]
) {
  const tmpfileName = `thumbnail`;
  const tmp = path.join(os.tmpdir(), tmpfileName);
  const file = storage.bucket().file(originalPath);
  await file.download({destination: tmp});
  const [metadata] = await file.getMetadata();
  // convert to thumbnail
  options.unshift(tmp);
  options.push(tmp);
  await spawn('convert', options);
  // upload thumbnail
  await storage
    .bucket()
    .upload(tmp, {
      destination: originalPath,
      metadata: {
        contentType: metadata.contentType,
        cacheControl: 'no-cache public',
      },
    })
    .then((resp) => resp[0].makePublic());
  // free up disk space
  fs.unlinkSync(tmp);
}
