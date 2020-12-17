export function getPaginatedOpenPositionsFromCollectionRef(
  openPositionRef,
  limit,
  last
) {
  openPositionRef = openPositionRef.orderBy('timestamp', 'desc');
  if (last) openPositionRef = openPositionRef.startAt(last.timestamp);
  return openPositionRef
    .limit(limit)
    .get()
    .then((qs) => {
      const openPositions = [];
      qs.forEach((doc) => {
        const openPosition = doc.data();
        openPosition.resourceType = 'openPosition';
        openPosition.id = doc.id;
        openPositions.push(openPosition);
      });
      return openPositions;
    });
}
