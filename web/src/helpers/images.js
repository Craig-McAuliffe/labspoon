import {storage} from '../firebase';
import {v4 as uuid} from 'uuid';

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

export async function uploadImagesAndGetURLs(images, storageDir) {
  const promises = images.map(async (image) => {
    const imageStorageRef = storage.ref(`${storageDir}/${uuid()}`);
    await imageStorageRef
      .put(image, {contentType: image.type})
      .catch((err) => console.error(err));
    return imageStorageRef.getDownloadURL();
  });
  return Promise.all(promises);
}
