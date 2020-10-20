import {projectURL} from '../config';

// Retrieves paginated group references from passed group reference collection
// for use in results pages. Returns a promise that returns an array of results
// when resolved. If there are no results, or the collection does not exist, an
// empty array of results is returned.
export function getPaginatedGroupReferencesFromCollectionRef(
  groupRefCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    groupRefCollection = groupRefCollection.startAt(last.id);
  }
  return groupRefCollection
    .limit(limit)
    .get()
    .then((qs) => {
      const groups = [];
      qs.forEach((doc) => {
        const group = doc.data();
        group.id = doc.id;
        group.resourceType = 'group';
        groups.push(group);
      });
      return groups;
    });
}

export function getDefaultAvatar() {
  return `https://storage.googleapis.com/${projectURL}/avatars/default_group_avatar.jpg`;
}
