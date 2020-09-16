import * as functions from 'firebase-functions';
import algoliasearch, {SearchClient} from 'algoliasearch';

const config = functions.config();
const algoliaConfig = config.algolia;

let algoliaClient: SearchClient;
if (algoliaConfig) {
  const algoliaID = algoliaConfig.app_id;
  const algoliaAdminKey = algoliaConfig.admin_key;
  algoliaClient = algoliasearch(algoliaID, algoliaAdminKey);
}

export const configureUseSearchIndex = functions.https.onRequest((req, res) => {
  if (!algoliaClient) {
    res.json({error: 'No algolia client available'});
    return res;
  }
  const index_name = 'dev_USERS';
  const index = algoliaClient.initIndex(index_name);
  return index
    .setSettings({
      searchableAttributes: [
        'institution',
        'name',
      ],
    })
    .then(() => res.json({result: `Configured ${index_name} search index`}))
    .catch((err) => res.json(err));
});

export const addUserToSearchIndex = functions.firestore.document(`users/{userID}`)
  .onCreate((change, context) => {
    if (!algoliaClient) return;
    const index_name = 'dev_USERS';
    const user = change.data();
    user.objectID = context.params.userID;
    const index = client.initIndex(index_name);
    return index.saveObject(user);
  }
);
