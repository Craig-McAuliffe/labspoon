import * as functions from 'firebase-functions';
import algoliasearch, {SearchClient} from 'algoliasearch';

const config = functions.config();
const environment = config.env.name;
const algoliaConfig = config.algolia;

const USER = 'user';
const GROUP = 'group';
const POST = 'post';
const PUBLICATION = 'publication';
const TOPIC = 'topic';

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

function configureSearchIndex(res: functions.Response<any>, indexName: string, searchableAttributes: Array<string>): void | Promise<void> {
  if (!algoliaClient) {
    res.json({error: 'No algolia client available'});
    return;
  }
  const index = algoliaClient.initIndex(indexName);
  index
    .setSettings({searchableAttributes: searchableAttributes})
    .then(() => res.json({result: `Configured ${indexName} search index`}))
    .catch((err) => res.json(err));
}

function addToIndex(id: string, change: functions.firestore.QueryDocumentSnapshot, resourceType: string, indexName: string): void | Promise<void> {
  if (!algoliaClient) return;
  const data = change.data();
  data.objectID = id;
  data.resourceType = resourceType;
  const index = algoliaClient.initIndex(indexName);
  index.saveObject(data);
}

export const configureUserSearchIndex = functions.https
  .onRequest((req, res): void | Promise<void> => configureSearchIndex(res, USERS_INDEX, ['name', 'institution']));

export const addUserToSearchIndex = functions.firestore.document(`users/{userID}`)
  .onCreate((change, context) => addToIndex(context.params.userID, change, USER, USERS_INDEX))

export const configureGroupSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, GROUPS_INDEX, ['name', 'location', 'institution', 'website', 'about'])
);

export const addGroupToSearchIndex = functions.firestore.document(`groups/{groupID}`)
  .onCreate((change, context) => addToIndex(context.params.groupID, change, GROUP, GROUPS_INDEX));

export const configurePostSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, POSTS_INDEX, ['title', 'content'])
);

export const addPostToSearchIndex = functions.firestore.document(`posts/{postID}`)
  .onCreate((change, context) => addToIndex(context.params.postID, change, POST, POSTS_INDEX));

export const configurePublicationSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, PUBLICATIONS_INDEX, ['title', 'content'])
);

export const addPublicationToSearchIndex = functions.firestore.document(`publications/{publicationID}`)
  .onCreate((change, context) => addToIndex(context.params.publicationID, change, PUBLICATION, PUBLICATIONS_INDEX));

export const configureTopicSearchIndex = functions.https.onRequest((_, res) =>
  configureSearchIndex(res, TOPICS_INDEX, ['title', 'content'])
);

export const addTopicToSearchIndex = functions.firestore.document(`topics/{topicID}`)
  .onCreate((change, context) => addToIndex(context.params.topicID, change, TOPIC, TOPICS_INDEX));
