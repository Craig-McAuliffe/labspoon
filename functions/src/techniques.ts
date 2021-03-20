import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef} from './groups';
import {TaggedTopic} from './topics';
import {UserRef} from './users';
import {ArticleBodyChild} from './researchFocuses';

const db = admin.firestore();

export const addTechniqueToAuthor = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onCreate((techniqueDS) => {
    const technique = techniqueDS.data();
    const authorID = technique.author.id;
    return db
      .doc(`users/${authorID}/techniques/${techniqueDS.id}`)
      .set(technique);
  });

export const addTechniqueToTopics = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onCreate(async (techniqueDS, context) => {
    const technique = techniqueDS.data();
    const techniqueID = context.params.techniqueID;
    const techniqueTopics = technique.topics;
    const topicsPromises = techniqueTopics.map((taggedTopic: TaggedTopic) => {
      if (!taggedTopic.id) return;
      return db
        .doc(`topics/${taggedTopic.id}/techniques/${techniqueID}`)
        .set(technique)
        .catch((err) =>
          console.error(
            'unable to add technique with id ' +
              techniqueID +
              ' to topic with id ' +
              taggedTopic.id,
            err
          )
        );
    });
    return await Promise.all(topicsPromises);
  });

export const updateTechniqueOnGroup = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate((techniqueDS) => {
    const technique = techniqueDS.after.data();
    const oldTechniqueData = techniqueDS.before.data();
    // if user edited article, this will already be updated
    if (
      JSON.stringify(technique.body) !== JSON.stringify(oldTechniqueData.body)
    )
      return;
    const groupID = technique.group.id;
    return db
      .doc(`groups/${groupID}/techniques/${techniqueDS.after.id}`)
      .set(technique);
  });

export const updateTechniqueOnAuthor = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate((techniqueDS) => {
    const technique = techniqueDS.after.data();
    const authorID = technique.author.id;
    return db
      .doc(`users/${authorID}/techniques/${techniqueDS.after.id}`)
      .set(technique);
  });

export const updateTechniqueOnTopics = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate(async (techniqueDS, context) => {
    const technique = techniqueDS.after.data();
    const techniqueID = context.params.techniqueID;
    const techniqueTopics = technique.topics;
    const topicsPromises = techniqueTopics.map((taggedTopic: TaggedTopic) => {
      if (!taggedTopic.id) return;
      return db
        .doc(`topics/${taggedTopic.id}/techniques/${techniqueID}`)
        .set(technique)
        .catch((err) =>
          console.error(
            'unable to update technique with id ' +
              techniqueID +
              ' on topic with id ' +
              taggedTopic.id,
            err
          )
        );
    });
    return await Promise.all(topicsPromises);
  });

export interface Technique {
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
