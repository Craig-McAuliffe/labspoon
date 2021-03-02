import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef, groupRefToGroupSignature, GroupSignature} from './groups';

import {TaggedTopic, handleTopicsNoID} from './topics';
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
      position: data.position,
      address: data.address,
      salary: data.salary,
      startDate: data.startDate,
      applyEmail: data.applyEmail,
      applyLink: data.applyLink,
      description: data.description,
    };

    const openPositionTopics: TaggedTopic[] = [];
    const matchedTopicsPromises = await handleTopicsNoID(
      data.topics,
      openPositionTopics
    );
    await Promise.all(matchedTopicsPromises);
    const processedOpenPosition: OpenPosition = {
      author: author,
      content: content,
      topics: openPositionTopics,
      group: data.group,
      timestamp: new Date(),
      unixTimeStamp: Math.floor(new Date().getTime() / 1000),
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
    batch.set(
      authorOpenPositionsRef,
      openPosToOpenPosListItem(processedOpenPosition, openPositionID)
    );
    batch.set(
      groupOpenPositionsRef,
      openPosToOpenPosListItem(processedOpenPosition, openPositionID)
    );
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

export const addOpenPosToTopics = functions.firestore
  .document(`openPositions/{openPositionID}`)
  .onCreate(async (openPositionDS, context) => {
    const openPosition = openPositionDS.data() as OpenPosition;
    const openPositionID = context.params.openPositionID;
    const openPositionTopics = openPosition.topics;
    if (!openPositionTopics || openPositionTopics.length === 0) return;
    const topicsPromises = openPositionTopics.map(
      (taggedTopic: TaggedTopic) => {
        if (!taggedTopic.id) return Promise.resolve();
        return db
          .doc(`topics/${taggedTopic.id}/openPositions/${openPositionID}`)
          .set(openPosToOpenPosListItem(openPosition, openPositionID))
          .catch((err) =>
            console.error(
              'unable to add open position with id ' +
                openPositionID +
                ' to topic with id ' +
                taggedTopic.id,
              err
            )
          );
      }
    );
    return await Promise.all(topicsPromises);
  });

export const updateOpenPosOnGroup = functions.firestore
  .document(`openPositions/{openPositionID}`)
  .onUpdate((openPositionDS, context) => {
    const newOpenPositionData = openPositionDS.after.data() as OpenPosition;
    const oldOpenPositionData = openPositionDS.before.data() as OpenPosition;
    const groupID = oldOpenPositionData.group.id;
    const openPositionID = context.params.openPositionID;
    if (
      JSON.stringify(
        openPosToOpenPosListItem(newOpenPositionData, openPositionID)
      ) ===
      JSON.stringify(
        openPosToOpenPosListItem(oldOpenPositionData, openPositionID)
      )
    )
      return false;

    return db
      .doc(`groups/${groupID}/openPositions/${openPositionDS.after.id}`)
      .set(openPosToOpenPosListItem(newOpenPositionData, openPositionID));
  });

export const updateOpenPosOnUser = functions.firestore
  .document(`openPositions/{openPositionID}`)
  .onUpdate((openPositionDS, context) => {
    const newOpenPositionData = openPositionDS.after.data() as OpenPosition;
    const oldOpenPositionData = openPositionDS.before.data() as OpenPosition;
    const openPositionID = context.params.openPositionID;
    if (
      JSON.stringify(
        openPosToOpenPosListItem(newOpenPositionData, openPositionID)
      ) ===
      JSON.stringify(
        openPosToOpenPosListItem(oldOpenPositionData, openPositionID)
      )
    )
      return false;

    const authorID = oldOpenPositionData.author.id;
    return db
      .doc(`users/${authorID}/openPositions/${openPositionDS.after.id}`)
      .set(openPosToOpenPosListItem(newOpenPositionData, openPositionID));
  });

export const updateOpenPosOnTopic = functions.firestore
  .document(`openPositions/{openPositionID}`)
  .onUpdate(async (openPositionDS, context) => {
    const newOpenPositionData = openPositionDS.after.data() as OpenPosition;
    const oldOpenPositionData = openPositionDS.before.data() as OpenPosition;
    const openPositionID = context.params.openPositionID;
    if (
      JSON.stringify(
        openPosToOpenPosListItem(newOpenPositionData, openPositionID)
      ) ===
      JSON.stringify(
        openPosToOpenPosListItem(oldOpenPositionData, openPositionID)
      )
    )
      return false;
    const openPositionTopics = newOpenPositionData.topics;
    if (!openPositionTopics || openPositionTopics.length === 0) return false;
    const topicsPromises = openPositionTopics.map(
      (taggedTopic: TaggedTopic) => {
        if (!taggedTopic.id) return;
        return db
          .doc(`topics/${taggedTopic.id}/openPositions/${openPositionID}`)
          .set(openPosToOpenPosListItem(newOpenPositionData, openPositionID))
          .catch((err) =>
            console.error(
              'unable to update open position with id ' +
                openPositionID +
                ' on topic with id ' +
                taggedTopic.id,
              err
            )
          );
      }
    );
    return Promise.all(topicsPromises);
  });

export function openPosToOpenPosListItem(
  openPosition: OpenPosition,
  openPositionID: string
): OpenPositionListItem {
  const OpenPosContentToOpenPosListItemContent = (
    content: OpenPositionContent
  ) => {
    return {
      title: content.title,
      position: content.position,
      salary: content.salary,
      startDate: content.startDate,
      description: content.description,
    };
  };
  const openPositionListItem: OpenPositionListItem = {
    content: OpenPosContentToOpenPosListItemContent(openPosition.content),
    author: openPosition.author,
    topics: openPosition.topics,
    timestamp: openPosition.timestamp,
    unixTimeStamp: openPosition.unixTimeStamp,
    group: groupRefToGroupSignature(openPosition.group),
    id: openPositionID,
    filterTopicIDs: openPosition.filterTopicIDs,
  };
  return openPositionListItem;
}

export interface OpenPosition {
  content: OpenPositionContent;
  author: UserRef;
  topics?: TaggedTopic[];
  timestamp: Date;
  unixTimeStamp: number;
  group: GroupRef;
  id?: string;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
}

interface OpenPositionContent {
  title: string;
  position: string;
  address: string;
  salary: string;
  startDate: string;
  applyEmail: string;
  applyLink: string;
  description: string;
}

export interface OpenPositionListItem {
  content: OpenPositionListItemContent;
  author: UserRef;
  topics?: TaggedTopic[];
  timestamp: Date;
  unixTimeStamp: number;
  group: GroupSignature;
  id?: string;
  filterTopicIDs: string[];
}

interface OpenPositionListItemContent {
  title: string;
  position: string;
  salary: string;
  startDate: string;
  description: string;
}
