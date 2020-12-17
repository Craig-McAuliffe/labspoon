import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef, toGroupRef} from './groups';

import {TaggedTopic, handleTaggedTopics} from './topics';
import {UserRef, checkAuthAndGetUserFromContext} from './users';

const db = admin.firestore();

export const createOpenPosition = functions.https.onCall(
  async (data, context) => {
    const author = await checkAuthAndGetUserFromContext(context);
    const authorID = author.id;
    const groupID = data.group.id;
    // change to check user is admin when we introduce group roles
    let userIsAuthorised;
    try {
      userIsAuthorised = await checkUserIsMemberOfGroup(authorID, groupID);
    } catch {
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while creating the open position.'
      );
    }
    if (!userIsAuthorised) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User is not permitted to modify this group'
      );
    }
    const openPositionRef = db.collection('openPositions').doc();
    const openPositionID = openPositionRef.id;
    const content: OpenPositionContent = {
      title: data.title,
      address: data.address,
      salary: data.salary,
      startDate: data.startDate,
      applyEmail: data.applyEmail,
      applyLink: data.applyLink,
      description: data.description,
    };

    const openPositionTopics: TaggedTopic[] = [];
    const matchedTopicsPromises = handleTaggedTopics(
      data.topics,
      openPositionTopics
    );
    await Promise.all(matchedTopicsPromises);
    const processedOpenPosition: OpenPosition = {
      author: author,
      content: content,
      topics: openPositionTopics,
      group: data.group,
      customTopics: data.customTopics,
      timestamp: new Date(),
      filterTopicIDs: openPositionTopics.map(
        (taggedTopic: TaggedTopic) => taggedTopic.id
      ),
    };
    const authorOpenPositionsRef = db.doc(
      `users/${authorID}/openPositions/${openPositionID}`
    );
    const groupOpenPositionsRef = db.doc(
      `groups/${groupID}/openPositions/${openPositionID}`
    );
    const batch = db.batch();
    batch.set(openPositionRef, processedOpenPosition);
    batch.set(authorOpenPositionsRef, processedOpenPosition);
    batch.set(groupOpenPositionsRef, processedOpenPosition);
    await batch.commit().catch((err) => {
      console.error(
        `could not create open position with id ${openPositionID}` + err
      );
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while creating the open position.'
      );
    });
  }
);

async function checkUserIsMemberOfGroup(authorID: string, groupID: string) {
  return db
    .doc(`users/${authorID}/groups/${groupID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) {
        return false;
      }
      return true;
    })
    .catch((err) => {
      console.error(
        'unable to verify if user with id' +
          authorID +
          'is a member of group with id' +
          groupID,
        err
      );
      throw new Error(
        'unable to verify if user with id' +
          authorID +
          'is a member of group with id' +
          groupID
      );
    });
}

export const updateOpenPosUponUserChange = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const userID = context.params.userID;
    const user = change.after.data() as UserRef;
    const openPositionsIDsToBeUpdated: string[] = [];
    await db
      .collection(`users/${userID}/openPositions`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const openPositionID = ds.id;
          openPositionsIDsToBeUpdated.push(openPositionID);
        });
      })
      .catch((err) =>
        console.error(
          'unable to retrieve openPositions by user with id' + userID
        )
      );
    const openPositionUpdatesPromises = openPositionsIDsToBeUpdated.map(
      (openPositionIDToBeUpdated) =>
        db
          .doc(`openPositions/${openPositionIDToBeUpdated}`)
          .update({author: user})
          .catch((err) =>
            console.error(
              'unable to update openPosition with id' +
                openPositionIDToBeUpdated +
                'with new userRef for user with id' +
                userID
            )
          )
    );
    return Promise.all(openPositionUpdatesPromises);
  });

export const updateOpenPosUponGroupChange = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const group = toGroupRef(groupID, change.after.data());
    const openPositionsIDsToBeUpdated: string[] = [];
    await db
      .collection(`groups/${groupID}/openPositions`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const openPositionID = ds.id;
          openPositionsIDsToBeUpdated.push(openPositionID);
        });
      })
      .catch((err) =>
        console.error(
          'unable to retrieve openPositions by group with id' + groupID
        )
      );
    const openPositionUpdatesPromises = openPositionsIDsToBeUpdated.map(
      (openPositionIDToBeUpdated) =>
        db
          .doc(`openPositions/${openPositionIDToBeUpdated}`)
          .update({group: group})
          .catch((err) =>
            console.error(
              'unable to update openPosition with id' +
                openPositionIDToBeUpdated +
                'with new groupRef for group with id' +
                groupID
            )
          )
    );
    return Promise.all(openPositionUpdatesPromises);
  });

export const syncOpenPosUpdateToUserAndGroup = functions.firestore
  .document('openPositions/{openPositionID}')
  .onUpdate(async (change, context) => {
    const openPosition = change.after.data();
    const openPositionID = context.params.openPositionID;
    const authorID = openPosition.author.id;
    const groupID = openPosition.group.id;
    const batch = db.batch();
    batch.set(
      db.doc(`users/${authorID}/openPositions/${openPositionID}`),
      openPosition
    );
    batch.set(
      db.doc(`groups/${groupID}/openPositions/${openPositionID}`),
      openPosition
    );
    await batch.commit().catch((err) => {
      console.error(
        `could not update open position with id ${openPositionID} on user doc with id ${authorID} and on group with id ${groupID}` +
          err
      );
    });
  });

interface OpenPosition {
  content: OpenPositionContent;
  author: UserRef;
  topics?: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  group: GroupRef;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
}

interface OpenPositionContent {
  title: string;
  address: string;
  salary: string;
  startDate: string;
  applyEmail: string;
  applyLink: string;
  description: string;
}
