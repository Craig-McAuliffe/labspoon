import {firebaseConfig} from '../config';
import {db} from '../firebase';

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
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/avatars/default_group_avatar.jpg`;
}

export function getAvatar(groupID) {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/groups/${groupID}/avatar`;
}

export function getGroup(id) {
  return db
    .doc(`groups/${id}`)
    .get()
    .then((groupData) => {
      if (!groupData.exists) return undefined;
      const data = groupData.data();
      data.id = groupData.id;
      return data;
    })
    .catch((err) => console.log(err));
}

export function convertGroupToGroupRef(group) {
  const groupRef = {
    id: group.id,
    name: group.name,
    avatar: group.avatar,
  };
  if (group.about) groupRef.about = group.about;
  if (group.institution) groupRef.institution = group.institution;
  return groupRef;
}
