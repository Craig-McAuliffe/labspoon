export function getPaginatedVideosFromCollectionRef(
  videosCollectionRef,
  limit,
  last
) {
  videosCollectionRef = videosCollectionRef.orderBy('timestamp', 'desc');
  if (last) videosCollectionRef = videosCollectionRef.startAt(last.timestamp);
  return videosCollectionRef
    .limit(limit)
    .get()
    .then((qs) => {
      const videos = [];
      qs.forEach((doc) => {
        const image = doc.data();
        image.resourceType = 'video';
        image.id = doc.id;
        videos.push(image);
      });
      return videos;
    });
}
