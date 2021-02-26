import {firebaseConfig} from '../config';
import firebase, {db} from '../firebase';

// Retrieves paginated user references from passed user reference collection
// for use in results pages. Returns a promise that returns an array of results
// when resolved. If there are no results, or the collection does not exist, an
// empty array of results is returned.
export function getPaginatedUserReferencesFromCollectionRef(
  userRefCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    userRefCollection = userRefCollection.startAt(last.id);
  }
  return userRefCollection
    .limit(limit)
    .get()
    .then((qs) => {
      const users = [];
      qs.forEach((doc) => {
        const user = doc.data();
        user.resourceType = 'user';
        users.push(user);
      });
      return users;
    });
}

export function getDefaultAvatar() {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/avatars/default_avatar.jpg`;
}

export function getDefaultCoverPhoto() {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/avatars/default_cover_photo.png`;
}

export function getAvatar(userID) {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/users/${userID}/avatar`;
}

export function getCoverPhoto(userID) {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/users/${userID}/coverPhoto`;
}

export function getUserGroups(userID) {
  return db
    .collection(`users/${userID}/groups`)
    .get()
    .then((qs) => {
      if (qs.empty) return [];
      const groups = [];
      qs.forEach((groupDoc) => {
        const fetchedGroup = groupDoc.data();
        fetchedGroup.id = groupDoc.id;
        groups.push(fetchedGroup);
      });
      return groups;
    });
}

export function createUserDocOnSignUp(
  result,
  setLoading,
  userName,
  updateUserDetails
) {
  const addUserToDB = () =>
    db
      .doc(`users/${result.user.uid}`)
      .set({
        id: result.user.uid,
        name: result.user.displayName,
        nameChangeTimeStamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        updateUserDetails(result.user);
        if (setLoading) setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        firebase
          .auth()
          .currentUser.delete.then(() =>
            alert('Something went wrong. Please try again.')
          )
          .catch((err) => {
            console.error(
              'unable to delete auth user with id' + result.user.uid,
              err
            );
            alert(
              'Something went wrong. Please contact our support team at help@labspoon.com from the email address that you are trying to sign up with. We apologise for the inconvenience.'
            );
          });
        if (setLoading) setLoading(false);
      });

  result.user
    .updateProfile({displayName: userName})
    .then(() => addUserToDB())
    .catch((err) => {
      console.error(err);
      addUserToDB();
    });
}

export function userToUserRef(user, userID) {
  const userRef = {
    id: userID,
    name: user.name,
  };
  if (user.avatar) userRef.avatar = user.avatar;
  if (user.rank) userRef.rank = user.rank;
  return userRef;
}

export function userToCustomPubUserRef(user, userID, microsoftID) {
  const customPubUserRef = {
    id: userID,
    name: user.name,
  };
  if (microsoftID) customPubUserRef.microsoftID = microsoftID;
  return customPubUserRef;
}
