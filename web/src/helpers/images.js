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
