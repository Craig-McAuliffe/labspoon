import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef} from './groups';
import {TaggedTopic} from './topics';
import {UserRef} from './users';

const db = admin.firestore();

export const addResearchFocusToAuthor = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onCreate((researchFocusDS) => {
    const researchFocus = researchFocusDS.data();
    const authorID = researchFocus.author.id;
    return db
      .doc(`users/${authorID}/researchFocuses/${researchFocusDS.id}`)
      .set(researchFocus);
  });

export const addResearchFocusToTopics = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onCreate(async (researchFocusDS, context) => {
    const researchFocus = researchFocusDS.data();
    const researchFocusID = context.params.researchFocusID;
    const researchFocusTopics = researchFocus.topics;
    const topicsPromises = researchFocusTopics.map(
      (taggedTopic: TaggedTopic) => {
        if (!taggedTopic.id) return;
        return db
          .doc(`topics/${taggedTopic.id}/researchFocuses/${researchFocusID}`)
          .set(researchFocus)
          .catch((err) =>
            console.error(
              'unable to add research focus with id ' +
                researchFocusID +
                ' to topic with id ' +
                taggedTopic.id,
              err
            )
          );
      }
    );
    return await Promise.all(topicsPromises);
  });

export const updateResearchFocusOnGroup = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onUpdate((researchFocusDS) => {
    const researchFocus = researchFocusDS.after.data();
    const oldResearchFocusData = researchFocusDS.before.data();
    // if user edited article, this will already be updated
    if (
      JSON.stringify(researchFocus.body) !==
      JSON.stringify(oldResearchFocusData.body)
    )
      return;
    const groupID = researchFocus.group.id;
    return db
      .doc(`groups/${groupID}/researchFocuses/${researchFocusDS.after.id}`)
      .set(researchFocus);
  });

export const updateResearchFocusOnAuthor = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onUpdate((researchFocusDS) => {
    const researchFocus = researchFocusDS.after.data();
    const authorID = researchFocus.author.id;
    return db
      .doc(`users/${authorID}/researchFocuses/${researchFocusDS.after.id}`)
      .set(researchFocus);
  });

export const updateResearchFocusOnTopics = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onUpdate(async (researchFocusDS, context) => {
    const researchFocus = researchFocusDS.after.data();
    const researchFocusID = context.params.researchFocusID;
    const researchFocusTopics = researchFocus.topics;
    const topicsPromises = researchFocusTopics.map(
      (taggedTopic: TaggedTopic) => {
        if (!taggedTopic.id) return;
        return db
          .doc(`topics/${taggedTopic.id}/researchFocuses/${researchFocusID}`)
          .set(researchFocus)
          .catch((err) =>
            console.error(
              'unable to update researchFocus with id ' +
                researchFocusID +
                ' on topic with id ' +
                taggedTopic.id,
              err
            )
          );
      }
    );
    return await Promise.all(topicsPromises);
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
