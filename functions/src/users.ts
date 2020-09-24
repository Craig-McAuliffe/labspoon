import * as functions from 'firebase-functions';
import {admin} from './config';

const db = admin.firestore();

export const instantiateFollowingFeedForNewUser = functions.firestore
  .document('users/{userID}')
  .onCreate(async (change, context) => {
    const userID = change.id;
    await db.doc(`users/${userID}/feeds/followingFeed`).set({
      id: 'followingFeed',
    });
  });
