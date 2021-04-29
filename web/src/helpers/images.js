import firebase, {storage} from '../firebase';
import {v4 as uuid} from 'uuid';
import {deleteUploadedFileOnError} from '../components/Images/ImageUpload';

const resizeImageOnRequest = firebase
  .functions()
  .httpsCallable('images-resizeImageOnCall');

export function getPaginatedImagesFromCollectionRef(
  imagesCollectionRef,
  limit,
  last
) {
  imagesCollectionRef = imagesCollectionRef.orderBy('timestamp', 'desc');
  if (last) imagesCollectionRef = imagesCollectionRef.startAt(last.timestamp);
  return imagesCollectionRef
    .limit(limit)
    .get()
    .then((qs) => {
      const images = [];
      qs.forEach((doc) => {
        const image = doc.data();
        image.resourceType = 'image';
        image.id = doc.id;
        image.alt = 'image';
        images.push(image);
      });
      return images;
    });
}

export async function uploadImagesAndGetURLs(images, storageDir, groupID) {
  const resizeOptions = [
    '-thumbnail',
    '400x400^',
    '-gravity',
    'center',
    '-extent',
    '400x400',
  ];
  if (!groupID) {
    console.error('image resize needs groupID');
    if (setLoading) setLoading(false);
    return undefined;
  }
  const promises = images.map(async (image) => {
    const filePath = `${storageDir}/${uuid()}_fullSize`;
    const imageStorageRef = storage.ref(filePath);
    await imageStorageRef
      .put(image, {contentType: image.type})
      .catch((err) => console.error(err));
    return resizeImageOnRequest({
      filePath: filePath,
      resizeOptions: resizeOptions,
      groupID: groupID,
    })
      .then(async (publicURL) => {
        if (!publicURL || !publicURL.data) {
          console.error(
            'photo upload did not return public URL ' + filePath + err
          );
          await deleteUploadedFileOnError(imageStorageRef);
          return undefined;
        }
        return publicURL.data;
      })
      .catch(async (err) => {
        console.error('unable to resize image at ' + filePath + err);
        await deleteUploadedFileOnError(imageStorageRef);
        return undefined;
      });
  });
  return Promise.all(promises);
}
