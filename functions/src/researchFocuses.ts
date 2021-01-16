import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef} from './groups';
import {TaggedTopic} from './topics';
import {UserRef} from './users';

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
