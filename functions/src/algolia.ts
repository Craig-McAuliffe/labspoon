import * as functions from 'firebase-functions';
import algoliasearch, {SearchClient} from 'algoliasearch';
import {config, environment, ResourceTypes} from './config';
import {toUserAlgoliaFilterRef, User} from './users';
import {Group, groupToAlgoliaGroupRef} from './groups';
import {Post, postToPostRef} from './posts';
import {OpenPosition, openPosToOpenPosListItem} from './openPositions';

const algoliaConfig = config.algolia;

const USERS_INDEX = environment + '_USERS';
const GROUPS_INDEX = environment + '_GROUPS';
const POSTS_INDEX = environment + '_POSTS';
const OPENPOSITIONS_INDEX = environment + '_OPENPOSITIONS';

let algoliaClient: SearchClient;
if (algoliaConfig) {
  const algoliaID = algoliaConfig.app_id;
  const algoliaAdminKey = algoliaConfig.admin_key;
  algoliaClient = algoliasearch(algoliaID, algoliaAdminKey);
}

async function configureSearchIndex(
  res: functions.Response<any>,
  indexName: string,
  searchableAttributes: Array<string>,
  filterableAttributes?: Array<string>,
  customRanking?: Array<string>
): Promise<void> {
  if (!algoliaClient) {
    res.json({error: 'No algolia client available'});
    return;
  }
  const index = algoliaClient.initIndex(indexName);
  await index
    .setSettings({
      searchableAttributes: searchableAttributes,
      attributesForFaceting: filterableAttributes,
      customRanking: customRanking,
    })
    .then(() => res.json({result: `Configured ${indexName} search index`}))
    .catch((err: Error) => res.json(err))
    .finally(() => res.end());
}

function addToIndex(
  id: string,
  data: any,
  resourceType: string,
  indexName: string
): boolean {
  if (!algoliaClient) return true;
  data.objectID = id;
  data.resourceType = resourceType;
  const index = algoliaClient.initIndex(indexName);
  index.saveObject(data);
  return true;
}

export const configureUserSearchIndex = functions.https.onRequest(
  (req, res): void | Promise<void> =>
    configureSearchIndex(res, USERS_INDEX, [
      'name',
      'institution',
      'recentPostTopics.name',
      'recentPublicationTopics.name',
    ])
);

export const addUserToSearchIndex = functions.firestore
  .document(`users/{userID}`)
  .onCreate((change, context): boolean => {
    const userRef = toUserAlgoliaFilterRef(
      change.data() as User,
      context.params.userID
    );
    return addToIndex(
      context.params.userID,
      userRef,
      ResourceTypes.USER,
      USERS_INDEX
    );
  });

export const updateUserToSearchIndex = functions.firestore
  .document(`users/{userID}`)
  .onUpdate((change, context): boolean => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserAlgoliaFilterRef(newUserData, userID)) ===
      JSON.stringify(toUserAlgoliaFilterRef(oldUserData, userID))
    )
      return false;
    return addToIndex(
      userID,
      toUserAlgoliaFilterRef(newUserData, userID),
      ResourceTypes.USER,
      USERS_INDEX
    );
  });

export const configureGroupSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, GROUPS_INDEX, [
    'unordered(name)',
    'unordered(about)',
    'unordered(institution)',
    'unordered(location)',
    'recentPostTopics.name',
    'recentArticleTopics.name',
    'recentPublicationTopics.name',
  ])
);

export const addGroupToSearchIndex = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate((change, context): boolean => {
    const group = change.data() as Group;
    const groupRef = groupToAlgoliaGroupRef(group, context.params.groupID);
    return addToIndex(
      context.params.groupID,
      groupRef,
      ResourceTypes.GROUP,
      GROUPS_INDEX
    );
  });

export const updateGroupToSearchIndex = functions.firestore
  .document(`groups/{groupID}`)
  .onUpdate((change, context): boolean => {
    const newGroupData = change.after.data() as Group;
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToAlgoliaGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToAlgoliaGroupRef(oldGroupData, groupID))
    )
      return false;
    const groupRef = groupToAlgoliaGroupRef(newGroupData, groupID);
    return addToIndex(groupID, groupRef, ResourceTypes.GROUP, GROUPS_INDEX);
  });

export const configurePostSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(
    res,
    POSTS_INDEX,
    [
      'unordered(content.text)',
      'unordered(topics.name)',
      'author.name',
      'publication.title',
      'openPosition.content.title',
    ],
    ['postType.id'],
    ['desc(recommendedCount)', 'desc(unixTimeStamp)', 'desc(bookmarkedCount)']
  )
);

export const addPostToSearchIndex = functions.firestore
  .document(`posts/{postID}`)
  .onCreate((change, context): boolean => {
    const post = change.data() as Post;
    return addToIndex(
      context.params.postID,
      postToPostRef(post),
      ResourceTypes.POST,
      POSTS_INDEX
    );
  });

export const updatePostToSearchIndex = functions.firestore
  .document(`posts/{postID}`)
  .onUpdate((change, context): boolean => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    if (
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
    )
      return false;
    return addToIndex(
      context.params.postID,
      postToPostRef(newPostData),
      ResourceTypes.POST,
      POSTS_INDEX
    );
  });

export const configureOpenPositionSearchIndex = functions.https.onRequest(
  (_, res) =>
    configureSearchIndex(
      res,
      OPENPOSITIONS_INDEX,
      [
        'unordered(content.title)',
        'unordered(content.description)',
        'topics.name',
      ],
      ['content.position'],
      ['desc(unixTimeStamp)']
    )
);

export const addOpenPositionToSearchIndex = functions.firestore
  .document(`openPositions/{openPositionID}`)
  .onCreate((change, context): boolean => {
    const openPosition = change.data() as OpenPosition;
    const openPositionID = context.params.openPositionID;
    return addToIndex(
      openPositionID,
      openPosToOpenPosListItem(openPosition, openPositionID),
      ResourceTypes.OPEN_POSITION,
      OPENPOSITIONS_INDEX
    );
  });

export const updateOpenPositionToSearchIndex = functions.firestore
  .document('openPositions/{openPositionID}')
  .onUpdate((change, context): boolean => {
    const newOpenPositionData = change.after.data() as OpenPosition;
    const oldOpenPositionData = change.before.data() as OpenPosition;
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
    return addToIndex(
      context.params.openPositionID,
      openPosToOpenPosListItem(newOpenPositionData, openPositionID),
      ResourceTypes.OPEN_POSITION,
      OPENPOSITIONS_INDEX
    );
  });
