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

export function algoliaOpenPosToDBOpenPosListItem(algoliaOpenPos) {
  const dbOpenPositionListItem = {
    content: {
      title: algoliaOpenPos.content.title,
      position: algoliaOpenPos.content.position,
      salary: algoliaOpenPos.content.salary,
      startDate: algoliaOpenPos.content.startDate,
      description: algoliaOpenPos.content.description,
    },
    topics: algoliaOpenPos.topics,
    group: algoliaOpenPos.group,
    id: algoliaOpenPos.id,
  };
  return dbOpenPositionListItem;
}
