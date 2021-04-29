import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef, groupRefToGroupSignature, GroupSignature} from './groups';
import {Technique} from './techniques';
import {TaggedTopic} from './topics';

const db = admin.firestore();

export const addResearchFocusToTopics = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onCreate(async (researchFocusDS, context) => {
    const researchFocus = researchFocusDS.data() as ResearchFocus;
    const researchFocusID = context.params.researchFocusID;
    const researchFocusTopics = researchFocus.topics;
    if (!researchFocusTopics || researchFocusTopics.length === 0) return;
    const topicsPromises = researchFocusTopics.map(
      (taggedTopic: TaggedTopic) => {
        if (!taggedTopic.id) return;
        return db
          .doc(`topics/${taggedTopic.id}/researchFocuses/${researchFocusID}`)
          .set(articleToArticleListItem(researchFocus))
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
    const researchFocus = researchFocusDS.after.data() as ResearchFocus;
    const oldResearchFocusData = researchFocusDS.before.data() as ResearchFocus;
    // if user edited article, this will already be updated
    if (
      JSON.stringify(researchFocus.body) !==
      JSON.stringify(oldResearchFocusData.body)
    )
      return;
    if (
      JSON.stringify(articleToArticleListItem(researchFocus)) ===
      JSON.stringify(articleToArticleListItem(oldResearchFocusData))
    )
      return;
    const groupID = researchFocus.group.id;
    return db
      .doc(`groups/${groupID}/researchFocuses/${researchFocusDS.after.id}`)
      .set(articleToArticleListItem(researchFocus));
  });

export const updateResearchFocusOnTopics = functions.firestore
  .document(`researchFocuses/{researchFocusID}`)
  .onUpdate(async (researchFocusDS, context) => {
    const oldResearchFocusData = researchFocusDS.before.data() as ResearchFocus;
    const researchFocus = researchFocusDS.after.data() as ResearchFocus;
    const researchFocusID = context.params.researchFocusID;
    const researchFocusTopics = researchFocus.topics;
    if (
      JSON.stringify(articleToArticleListItem(researchFocus)) ===
      JSON.stringify(articleToArticleListItem(oldResearchFocusData))
    )
      return;
    if (!researchFocusTopics || researchFocusTopics.length === 0) return;
    const topicsPromises = researchFocusTopics.map(
      (taggedTopic: TaggedTopic) => {
        if (!taggedTopic.id) return;
        return db
          .doc(`topics/${taggedTopic.id}/researchFocuses/${researchFocusID}`)
          .set(articleToArticleListItem(researchFocus))
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

export function articleToArticleListItem(
  article: ResearchFocus | Technique
): ResearchFocusListItem {
  const researchFocusListItem: ResearchFocusListItem = {
    title: article.title,
    timestamp: article.timestamp,
    group: groupRefToGroupSignature(article.group, article.group.id),
    body: article.body,
  };
  if (article.topics) researchFocusListItem.topics = article.topics;
  if (article.customTopics)
    researchFocusListItem.customTopics = article.customTopics;
  if (article.photoURLs) researchFocusListItem.photoURLs = article.photoURLs;
  if (article.filterTopicIDs)
    researchFocusListItem.filterTopicIDs = article.filterTopicIDs;
  return researchFocusListItem;
}

export interface ResearchFocus {
  title: string;
  topics?: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  photoURLs?: string[];
  group: GroupRef;
  filterTopicIDs?: string[];
  body: ArticleBodyChild[];
  id?: string;
}

export interface ResearchFocusListItem {
  title: string;
  topics?: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  photoURLs?: string[];
  group: GroupSignature;
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
