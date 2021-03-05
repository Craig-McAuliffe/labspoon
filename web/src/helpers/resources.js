export function getPaginatedResourcesFromCollectionRef(
  resourceRef,
  limit,
  last,
  resourceType,
  rankByName
) {
  if (rankByName) resourceRef = resourceRef.orderBy('name', 'asc');
  else resourceRef = resourceRef.orderBy('timestamp', 'desc');
  if (last) {
    if (rankByName) resourceRef = resourceRef.startAt(last.name);
    else resourceRef = resourceRef.startAt(last.timestamp);
  }
  return resourceRef
    .limit(limit)
    .get()
    .then((qs) => {
      const fetchedResources = [];
      qs.forEach((doc) => {
        const fetchedResource = doc.data();
        fetchedResource.resourceType = resourceType;
        fetchedResource.id = doc.id;
        fetchedResources.push(fetchedResource);
      });
      return fetchedResources;
    });
}
