import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef} from './groups';

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
        'could not create open position'
      );
    }
    if (!userIsAuthorised) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'user is not authorised to modify this group'
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
      throw new functions.https.HttpsError('internal', 'something went wrong');
    });
}

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
