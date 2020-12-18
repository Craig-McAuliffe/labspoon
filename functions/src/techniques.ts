import * as functions from 'firebase-functions';
import {admin} from './config';
import {toGroupRef} from './groups';
import {toUserRef} from './users';

const db = admin.firestore();

export const syncCreateToTechniqueCollection = functions.firestore
  .document(`groups/{groupID}/techniques/{techniqueID}`)
  .onCreate((techniqueDS) =>
    db.doc(`techniques/${techniqueDS.id}`).set(techniqueDS.data())
  );

export const syncCreateToAuthorTechniqueCollection = functions.firestore
  .document(`groups/{groupID}/techniques/{techniqueID}`)
  .onCreate((techniqueDS) => {
    const technique = techniqueDS.data();
    const authorID = technique.author.id;
    return db
      .doc(`users/${authorID}/techniques/${techniqueDS.id}`)
      .set(technique);
  });

export const syncUpdateToGroupTechniqueCollection = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate((techniqueDS) => {
    const technique = techniqueDS.after.data();
    const groupID = technique.group.id;
    return db
      .doc(`groups/${groupID}/techniques/${techniqueDS.after.id}`)
      .set(technique);
  });

export const syncUpdateToAuthorTechniqueCollection = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate((techniqueDS) => {
    const technique = techniqueDS.after.data();
    const authorID = technique.author.id;
    return db
      .doc(`users/${authorID}/techniques/${techniqueDS.after.id}`)
      .set(technique);
  });

export const updateTechniqueOnGroupChange = functions.firestore
  .document(`groups/{groupID}`)
  .onUpdate(async (groupDS) => {
    const groupID = groupDS.after.id;
    const techniqueQS = await db
      .collection(`groups/${groupID}/techniques`)
      .get();
    if (techniqueQS.empty) return;
    const groupRef = toGroupRef(groupID, groupDS.after.data());
    const techniqueUpdatePromises: Promise<any>[] = [];
    techniqueQS.forEach((techniqueDS) => {
      const techniqueID = techniqueDS.id;
      const updatePromise = db
        .doc(`techniques/${techniqueID}`)
        .update({
          group: groupRef,
        })
        .catch((err) =>
          console.error(
            `Failed to up group ${groupID} on technique ${techniqueID}:`,
            err
          )
        );
      techniqueUpdatePromises.push(updatePromise);
    });
    return Promise.all(techniqueUpdatePromises);
  });

export const updateTechniqueOnUserChange = functions.firestore
  .document(`users/{userID}`)
  .onUpdate(async (userDS) => {
    const userID = userDS.after.id;
    const techniqueQS = await db.collection(`users/${userID}/techniques`).get();
    const userRef = toUserRef(userID, userDS.after.data());
    const techniqueUpdatePromises: Promise<any>[] = [];
    techniqueQS.forEach((techniqueDS) => {
      const techniqueID = techniqueDS.id;
      const updatePromise = db
        .doc(`techniques/${techniqueID}`)
        .update({
          author: userRef,
        })
        .catch((err) =>
          console.error(
            `Failed to up user ${userID} on technique ${techniqueID}:`,
            err
          )
        );
      techniqueUpdatePromises.push(updatePromise);
    });
    return Promise.all(techniqueUpdatePromises);
  });
