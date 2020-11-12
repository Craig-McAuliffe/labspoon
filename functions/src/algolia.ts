import * as functions from 'firebase-functions';
import algoliasearch, {SearchClient} from 'algoliasearch';
import {config, environment, ResourceTypes} from './config';

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
  searchableAttributes: Array<string>
): void | Promise<void> {
  if (!algoliaClient) {
    res.json({error: 'No algolia client available'});
    return;
  }
  const index = algoliaClient.initIndex(indexName);
  index
    .setSettings({searchableAttributes: searchableAttributes})
    .then(() => res.json({result: `Configured ${indexName} search index`}))
    .catch((err: Error) => res.json(err));
}

function addToIndex(
  id: string,
  change: functions.firestore.QueryDocumentSnapshot,
  resourceType: string,
  indexName: string
): boolean {
  if (!algoliaClient) return true;
  const data = change.data();
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
  .onCreate((change, context): boolean =>
    addToIndex(context.params.userID, change, ResourceTypes.USER, USERS_INDEX)
  );

export const configureGroupSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, GROUPS_INDEX, [
    'name',
    'location',
    'institution',
    'website',
    'about',
  ])
);

export const addGroupToSearchIndex = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate((change, context): boolean =>
    addToIndex(
      context.params.groupID,
      change,
      ResourceTypes.GROUP,
      GROUPS_INDEX
    )
  );

export const configurePostSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, POSTS_INDEX, ['title', 'content'])
);

export const addPostToSearchIndex = functions.firestore
  .document(`posts/{postID}`)
  .onCreate((change, context): boolean =>
    addToIndex(context.params.postID, change, ResourceTypes.POST, POSTS_INDEX)
  );

export const configurePublicationSearchIndex = functions.https.onRequest(
  (_, res) =>
    configureSearchIndex(res, PUBLICATIONS_INDEX, ['title', 'content'])
);

export const addPublicationToSearchIndex = functions.firestore
  .document(`publications/{publicationID}`)
  .onCreate((change, context): boolean =>
    addToIndex(
      context.params.publicationID,
      change,
      ResourceTypes.PUBLICATION,
      PUBLICATIONS_INDEX
    )
  );

export const updatePublicationToSearchIndex = functions.firestore
  .document(`publications/{publicationID}`)
  .onUpdate((change, context): boolean =>
    addToIndex(
      context.params.publicationID,
      change.after,
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
      change,
      ResourceTypes.TOPIC,
      TOPICS_INDEX
    )
  );
