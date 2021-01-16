import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef, toGroupRef} from './groups';
import {TaggedTopic} from './topics';
import {toUserRef, UserRef} from './users';

const db = admin.firestore();

export const syncCreateToResearchFocusCollection = functions.firestore
  .document(`groups/{groupID}/researchFocuses/{researchFocusID}`)
  .onCreate((researchFocusDS) =>
    db.doc(`researchFocuses/${researchFocusDS.id}`).set(researchFocusDS.data())
  );

export const syncCreateToAuthorResearchFocusCollection = functions.firestore
  .document(`groups/{groupID}/researchFocuses/{researchFocusID}`)
  .onCreate((researchFocusDS) => {
    const researchFocus = researchFocusDS.data();
    const authorID = researchFocus.author.id;
    return db
      .doc(`users/${authorID}/researchFocuses/${researchFocusDS.id}`)
      .set(researchFocus);
  });

export const syncUpdateToGroupResearchFocusCollection = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onUpdate((researchFocusDS) => {
    const researchFocus = researchFocusDS.after.data();
    const groupID = researchFocus.group.id;
    return db
      .doc(`groups/${groupID}/researchFocuses/${researchFocusDS.after.id}`)
      .set(researchFocus);
  });

export const syncUpdateToAuthorResearchFocusCollection = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onUpdate((researchFocusDS) => {
    const researchFocus = researchFocusDS.after.data();
    const authorID = researchFocus.author.id;
    return db
      .doc(`users/${authorID}/researchFocuses/${researchFocusDS.after.id}`)
      .set(researchFocus);
  });

export const updateResearchFocusOnGroupChange = functions.firestore
  .document(`groups/{groupID}`)
  .onUpdate(async (groupDS) => {
    const groupID = groupDS.after.id;
    const researchFocusQS = await db
      .collection(`groups/${groupID}/researchFocuses`)
      .get();
    if (researchFocusQS.empty) return;
    const groupRef = toGroupRef(groupID, groupDS.after.data());
    const researchFocusUpdatePromises: Promise<any>[] = [];
    researchFocusQS.forEach((researchFocusDS) => {
      const researchFocusID = researchFocusDS.id;
      const updatePromise = db
        .doc(`researchFocuses/${researchFocusID}`)
        .update({
          group: groupRef,
        })
        .catch((err) =>
          console.error(
            `Failed to up group ${groupID} on researchFocus ${researchFocusID}:`,
            err
          )
        );
      researchFocusUpdatePromises.push(updatePromise);
    });
    return Promise.all(researchFocusUpdatePromises);
  });

export const updateResearchFocusOnUserChange = functions.firestore
  .document(`users/{userID}`)
  .onUpdate(async (userDS) => {
    const userID = userDS.after.id;
    const researchFocusQS = await db
      .collection(`users/${userID}/researchFocuses`)
      .get();
    const userRef = toUserRef(userID, userDS.after.data());
    const researchFocusUpdatePromises: Promise<any>[] = [];
    researchFocusQS.forEach((researchFocusDS) => {
      const researchFocusID = researchFocusDS.id;
      const updatePromise = db
        .doc(`researchFocuses/${researchFocusID}`)
        .update({
          author: userRef,
        })
        .catch((err) =>
          console.error(
            `Failed to up user ${userID} on researchFocus ${researchFocusID}:`,
            err
          )
        );
      researchFocusUpdatePromises.push(updatePromise);
    });
    return Promise.all(researchFocusUpdatePromises);
  });

export interface ResearchFocus {
  title: string;
  author: UserRef;
  topics?: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  photoURLs?: string[];
  group: GroupRef;
  filterTopicIDs?: string[];
  body: ArticleBodyChild[];
  id?: string;
}

export interface ArticleBodyChild {
  children: ArticleRichTextSection[];
  type: string;
}

export interface ArticleRichTextSection {
  text: string;
}
