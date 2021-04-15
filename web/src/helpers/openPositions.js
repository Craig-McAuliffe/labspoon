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
    author: algoliaOpenPos.author,
    group: algoliaOpenPos.group,
    id: algoliaOpenPos.id ? algoliaOpenPos.id : algoliaOpenPos.objectID,
  };
  if (algoliaOpenPos.author)
    dbOpenPositionListItem.author = algoliaOpenPos.author;
  if (algoliaOpenPos.timestamp)
    dbOpenPositionListItem.timestamp = algoliaOpenPos.timestamp;
  if (algoliaOpenPos.unixTimeStamp)
    dbOpenPositionListItem.unixTimeStamp = algoliaOpenPos.unixTimeStamp;
  if (algoliaOpenPos.filterTopicIDs)
    dbOpenPositionListItem.filterTopicIDs = algoliaOpenPos.filterTopicIDs;
  return dbOpenPositionListItem;
}

export function openPosToOpenPosListItem(openPosition, openPositionID) {
  const dbOpenPositionListItem = {
    content: {
      title: openPosition.content.title,
      position: openPosition.content.position,
      salary: openPosition.content.salary,
      startDate: openPosition.content.startDate,
      description: openPosition.content.description,
    },
    topics: openPosition.topics,
    group: openPosition.group,
    id: openPositionID,
  };
  if (openPosition.author) dbOpenPositionListItem.author = openPosition.author;
  if (openPosition.timestamp)
    dbOpenPositionListItem.timestamp = openPosition.timestamp;
  if (openPosition.unixTimeStamp)
    dbOpenPositionListItem.unixTimeStamp = openPosition.unixTimeStamp;
  if (openPosition.filterTopicIDs)
    dbOpenPositionListItem.filterTopicIDs = openPosition.filterTopicIDs;
  return dbOpenPositionListItem;
}
