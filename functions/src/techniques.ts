import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef} from './groups';
import {TaggedTopic} from './topics';
import {UserRef} from './users';
import {ArticleBodyChild, articleToArticleListItem} from './researchFocuses';

const db = admin.firestore();

export const addTechniqueToAuthor = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onCreate((techniqueDS) => {
    const technique = techniqueDS.data() as Technique;
    const authorID = technique.author.id;
    return db
      .doc(`users/${authorID}/techniques/${techniqueDS.id}`)
      .set(articleToArticleListItem(technique));
  });

export const addTechniqueToTopics = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onCreate(async (techniqueDS, context) => {
    const technique = techniqueDS.data() as Technique;
    const techniqueID = context.params.techniqueID;
    const techniqueTopics = technique.topics;
    if (!techniqueTopics || techniqueTopics.length === 0) return;
    const topicsPromises = techniqueTopics.map((taggedTopic: TaggedTopic) => {
      if (!taggedTopic.id) return;
      return db
        .doc(`topics/${taggedTopic.id}/techniques/${techniqueID}`)
        .set(articleToArticleListItem(technique))
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
    const technique = techniqueDS.after.data() as Technique;
    const oldTechniqueData = techniqueDS.before.data() as Technique;
    // if user edited article, this will already be updated
    if (
      JSON.stringify(technique.body) !== JSON.stringify(oldTechniqueData.body)
    )
      return;
    if (
      JSON.stringify(articleToArticleListItem(technique)) ===
      JSON.stringify(articleToArticleListItem(oldTechniqueData))
    )
      return;
    const groupID = technique.group.id;
    return db
      .doc(`groups/${groupID}/techniques/${techniqueDS.after.id}`)
      .set(articleToArticleListItem(technique));
  });

export const updateTechniqueOnAuthor = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate((techniqueDS) => {
    const technique = techniqueDS.after.data() as Technique;
    const oldTechniqueData = techniqueDS.before.data() as Technique;
    if (
      JSON.stringify(articleToArticleListItem(technique)) ===
      JSON.stringify(articleToArticleListItem(oldTechniqueData))
    )
      return;
    const authorID = technique.author.id;
    return db
      .doc(`users/${authorID}/techniques/${techniqueDS.after.id}`)
      .set(articleToArticleListItem(technique));
  });

export const updateTechniqueOnTopics = functions.firestore
  .document(`techniques/{techniqueID}`)
  .onUpdate(async (techniqueDS, context) => {
    const technique = techniqueDS.after.data() as Technique;
    const oldTechniqueData = techniqueDS.before.data() as Technique;
    const techniqueID = context.params.techniqueID;
    if (
      JSON.stringify(articleToArticleListItem(technique)) ===
      JSON.stringify(articleToArticleListItem(oldTechniqueData))
    )
      return;
    const techniqueTopics = technique.topics;
    if (!techniqueTopics || techniqueTopics.length === 0) return;
    const topicsPromises = techniqueTopics.map((taggedTopic: TaggedTopic) => {
      if (!taggedTopic.id) return;
      return db
        .doc(`topics/${taggedTopic.id}/techniques/${techniqueID}`)
        .set(articleToArticleListItem(articleToArticleListItem(technique)))
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
