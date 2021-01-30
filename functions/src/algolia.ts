import * as functions from 'firebase-functions';
import algoliasearch, {SearchClient} from 'algoliasearch';
import {config, environment, ResourceTypes} from './config';
import {toUserRef} from './users';
import {Group, groupToGroupRef} from './groups';

const algoliaConfig = config.algolia;

const USERS_INDEX = environment + '_USERS';
const GROUPS_INDEX = environment + '_GROUPS';
const POSTS_INDEX = environment + '_POSTS';
const PUBLICATIONS_INDEX = environment + '_PUBLICATIONS';
const TOPICS_INDEX = environment + '_TOPICS';

let algoliaClient: SearchClient;
if (algoliaConfig) {
  const algoliaID = algoliaConfig.app_id;
  const algoliaAdminKey = algoliaConfig.admin_key;
  algoliaClient = algoliasearch(algoliaID, algoliaAdminKey);
}

function configureSearchIndex(
  res: functions.Response<any>,
  indexName: string,
  searchableAttributes: Array<string>,
  filterableAttributes?: Array<string>,
  customRanking?: Array<string>
): void | Promise<void> {
  if (!algoliaClient) {
    res.json({error: 'No algolia client available'});
    return;
  }
  const index = algoliaClient.initIndex(indexName);
  index
    .setSettings({
      searchableAttributes: searchableAttributes,
      attributesForFaceting: filterableAttributes,
      customRanking: customRanking,
    })
    .then(() => res.json({result: `Configured ${indexName} search index`}))
    .catch((err: Error) => res.json(err));
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
    configureSearchIndex(res, USERS_INDEX, ['name', 'institution'])
);

export const addUserToSearchIndex = functions.firestore
  .document(`users/{userID}`)
  .onCreate((change, context): boolean => {
    const user = toUserRef(context.params.userID, change.data());
    return addToIndex(
      context.params.userID,
      user,
      ResourceTypes.USER,
      USERS_INDEX
    );
  });

export const updateUserToSearchIndex = functions.firestore
  .document(`users/{userID}`)
  .onUpdate((change, context): boolean => {
    const newUserData = change.after.data();
    const oldUserData = change.before.data();
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return false;
    return addToIndex(userID, newUserData, ResourceTypes.USER, USERS_INDEX);
  });

export const configureGroupSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, GROUPS_INDEX, [
    'unordered(name)',
    'unordered(about)',
    'unordered(institution)',
    'unordered(location)',
  ])
);

export const addGroupToSearchIndex = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate((change, context): boolean => {
    const group = change.data() as Group;
    const groupRef = groupToGroupRef(group, context.params.groupID);
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
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return false;
    const groupRef = groupToGroupRef(newGroupData, groupID);
    return addToIndex(groupID, groupRef, ResourceTypes.GROUP, GROUPS_INDEX);
  });

export const configurePostSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(
    res,
    POSTS_INDEX,
    ['unordered(content.text)', 'unordered(topics)', 'author.name'],
    ['postType'],
    ['desc(recommendedCount)', 'desc(unixTimeStamp)', 'desc(bookmarkedCount)']
  )
);

export const addPostToSearchIndex = functions.firestore
  .document(`posts/{postID}`)
  .onCreate((change, context): boolean => {
    const post = change.data();
    post.postType = post.postType.id;
    return addToIndex(
      context.params.postID,
      post,
      ResourceTypes.POST,
      POSTS_INDEX
    );
  });

export const updatePostToSearchIndex = functions.firestore
  .document(`posts/{postID}`)
  .onUpdate((change, context): boolean => {
    const post = change.after.data();
    post.postType = post.postType.id;
    return addToIndex(
      context.params.postID,
      post,
      ResourceTypes.POST,
      POSTS_INDEX
    );
  });

export const configurePublicationSearchIndex = functions.https.onRequest(
  (_, res) =>
    configureSearchIndex(res, PUBLICATIONS_INDEX, [
      'unordered(title)',
      'unordered(topics)',
    ])
);

export const addPublicationToSearchIndex = functions.firestore
  .document(`publications/{publicationID}`)
  .onCreate((change, context): boolean =>
    addToIndex(
      context.params.publicationID,
      change.data(),
      ResourceTypes.PUBLICATION,
      PUBLICATIONS_INDEX
    )
  );

export const updatePublicationToSearchIndex = functions.firestore
  .document(`publications/{publicationID}`)
  .onUpdate((change, context): boolean =>
    addToIndex(
      context.params.publicationID,
      change.after.data(),
      ResourceTypes.PUBLICATION,
      PUBLICATIONS_INDEX
    )
  );

export const configureTopicSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, TOPICS_INDEX, ['name'])
);

export const addTopicToSearchIndex = functions.firestore
  .document(`topics/{topicID}`)
  .onCreate((change, context): boolean =>
    addToIndex(
      context.params.topicID,
      change.data(),
      ResourceTypes.TOPIC,
      TOPICS_INDEX
    )
  );
