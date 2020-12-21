export function getPaginatedResourcesFromCollectionRef(
  resourceRef,
  limit,
  last,
  resourceType
) {
  resourceRef = resourceRef.orderBy('timestamp', 'desc');
  if (last) resourceRef = resourceRef.startAt(last.timestamp);
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
