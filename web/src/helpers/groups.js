import {firebaseConfig} from '../config';
import firebase, {db, storage} from '../firebase';
import {v4 as uuid} from 'uuid';

const resizeImage = firebase.functions().httpsCallable('images-resizeImage');

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
    about: group.about,
    institution: group.institution,
  };
  if (group.avatar) groupRef.avatar = group.avatar;
  return groupRef;
}

export function editGroupAvatarStorageInForm(
  avatar,
  groupID,
  setSubmitting,
  setError,
  writeToDB
) {
  const avatarFile = avatar[0];
  const avatarID = uuid();
  const avatarStoragePath = `groups/${groupID}/avatar/${avatarID}`;
  const avatarStorageRef = storage.ref(avatarStoragePath);
  const resizeOptions = [
    '-thumbnail',
    '200x200^',
    '-gravity',
    'center',
    '-extent',
    '200x200',
  ];
  return avatarStorageRef
    .put(avatarFile, {
      contentType: avatarFile.type,
    })
    .on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        // TODO: implement loading symbol
        // console.log('snapshot', snapshot);
      },
      (err) => {
        console.error(`failed to write avatar ${err}`);
        setSubmitting(false);
        setError(true);
      },
      () => {
        avatarStorageRef
          .getDownloadURL()
          .then(async (url) => {
            await resizeImage({
              filePath: avatarStoragePath,
              resizeOptions: resizeOptions,
            })
              .catch((err) => {
                setError(true);
                console.error(
                  'an error occurred while resizing the image',
                  err
                );
              })
              .then(async () => await writeToDB(avatarID, url));
          })
          .catch((err) => {
            console.error(
              'failed to get download url for ' +
                avatarStorageRef +
                ', therefore cannot update db',
              err
            );
            setSubmitting(false);
            setError(true);
          });
      }
    );
}
