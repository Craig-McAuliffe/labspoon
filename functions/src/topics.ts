import * as functions from 'firebase-functions';
import {MAKField, makFieldToTopic, TopicToMAKField} from './microsoft';
import {
  addRecentPostsToFollowingFeed,
  Post,
  updateFilterCollection,
  updateFiltersByPost,
} from './posts';
import {admin, config, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {
  doFollowPreferencesBlockPost,
  FollowPostTypePreferences,
} from './helpers';
import {UserRef} from './users';
import Axios from 'axios';

const db = admin.firestore();

export const topicSearch = functions.https.onCall(async (data) => {
  const topicQuery = data.topicQuery;
  const limit = data.limit;
  const skip = data.skip;
  if (topicQuery === undefined)
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A topic query must be provided'
    );
  const searchUrl = `https://topics-basic.search.windows.net/indexes/topic-search-by-name/docs?search=${topicQuery}&$top=${limit}${
    skip ? '&$skip=' + skip : ''
  }&api-version=2020-06-30`;
  const apiCallConfig = {
    headers: {
      ['Content-Type']: 'application/json',
      ['api-key']: config.azure.admin_key,
    },
  };

  const searchResponse: any = await Axios.get(searchUrl, apiCallConfig).catch(
    (err: Error) => {
      console.error(err);
      throw new functions.https.HttpsError('internal', 'An error occurred.');
    }
  );
  const searchResults: AzureTopicResult[] = searchResponse.data.value;
  const formattedTopics = searchResults.map((azureTopic) =>
    azureTopicToTopicNoID(azureTopic)
  );
  const topicsWithIDs: Topic[] = [];
  const createTopicsPromises = formattedTopics.map((topicNoLabspoonID) =>
    db
      .doc(`MSFields/${topicNoLabspoonID.microsoftID}`)
      .get()
      .then((doc) => {
        const addTopicWithID = (topicID: string) => {
          const topicWithID: TaggedTopic = {
            id: topicID,
            microsoftID: topicNoLabspoonID.microsoftID,
            name: topicNoLabspoonID.name,
            normalisedName: topicNoLabspoonID.normalisedName,
          };
          topicsWithIDs.push(topicWithID);
        };

        if (doc.exists) {
          const msFieldData = doc.data() as MAKField;
          addTopicWithID(msFieldData.processed);
          return;
        }
        return createFieldAndTopic(topicNoLabspoonID, addTopicWithID);
      })
  );
  await Promise.all(createTopicsPromises);
  return topicsWithIDs;
});

export async function createFieldAndTopic(
  topic: Topic,
  addTopicWithIDToTaggedResource?: Function
) {
  const MSFieldID = topic.microsoftID;
  const labspoonTopicRef = db.collection('topics').doc();
  const labspoonTopicID = labspoonTopicRef.id;
  const processedMSField: MAKField = TopicToMAKField(topic, labspoonTopicID);

  const batch = db.batch();
  batch.set(labspoonTopicRef, topic);
  batch.set(db.collection('MSFields').doc(MSFieldID), processedMSField);
  return batch
    .commit()
    .catch((err) => {
      console.error(`could not create new field and topic` + err);
      throw new functions.https.HttpsError(
        'internal',
        `An error occurred while processing the field, ${topic}`
      );
    })
    .then(() => {
      if (addTopicWithIDToTaggedResource)
        return addTopicWithIDToTaggedResource(labspoonTopicID);
    });
}

export function convertTaggedTopicToTopic(
  taggedTopic: TaggedTopic,
  rank?: boolean
) {
  const topic: Topic = {
    name: taggedTopic.name,
    normalisedName: taggedTopic.normalisedName,
    microsoftID: taggedTopic.microsoftID,
  };
  if (rank) topic.rank = 1;
  return topic;
}

export function convertTopicToTaggedTopic(topic: Topic, topicID: string) {
  const taggedTopic: TaggedTopic = {
    name: topic.name,
    normalisedName: topic.normalisedName,
    id: topicID,
    microsoftID: topic.microsoftID,
  };
  return taggedTopic;
}

export async function createTopicFromMSField(
  msFieldData: MAKField,
  addTopicWithIDToTaggedResource: Function
) {
  const labspoonTopicRef = db.collection('topics').doc();
  const labspoonTopicID = labspoonTopicRef.id;
  const microsoftID = msFieldData.FId.toString();
  const msFieldRef = db.doc(`MSFields/${microsoftID}`);
  if (!microsoftID) {
    console.error(
      'msField did not have an id. Cannot create a corresponding topic.'
    );
    return;
  }
  const batch = db.batch();
  batch.set(labspoonTopicRef, makFieldToTopic(msFieldData));
  batch.update(msFieldRef, {processed: labspoonTopicID});
  batch
    .commit()
    .then(() => addTopicWithIDToTaggedResource(labspoonTopicID))
    .catch((err) =>
      console.error(
        `could not create labspoon topic from existing MSField, ${err}`
      )
    );
}

export async function handleTopicsNoID(
  taggedTopicsNoIDs: Topic[],
  collectedTopics: TaggedTopic[]
) {
  const promises = taggedTopicsNoIDs.map((taggedTopicNoID: Topic) =>
    addTopicIDToTaggedTopic(taggedTopicNoID, collectedTopics)
  );
  return Promise.all(promises);
}

export async function addTopicIDToTaggedTopic(
  topicNoID: Topic,
  collectedTopics: TaggedTopic[]
) {
  return db
    .doc(`MSFields/${topicNoID.microsoftID}`)
    .get()
    .then(async (ds) => {
      function addTopicWithIDToTaggedResource(
        correspondingLabspoonTopicID: string
      ) {
        collectedTopics.push(
          convertTopicToTaggedTopic(topicNoID, correspondingLabspoonTopicID)
        );
      }
      if (ds.exists) {
        const MSFieldData = ds.data() as MAKField;
        if (MSFieldData.processed) {
          addTopicWithIDToTaggedResource(MSFieldData.processed);
        } else {
          // This should not be possible. All dbMSFields should be processed
          // upon creation.
          console.error(
            'no Labspoon topic corresponding to MSField ' +
              topicNoID.microsoftID
          );
          await createTopicFromMSField(
            MSFieldData,
            addTopicWithIDToTaggedResource
          );
        }
      } else {
        await createFieldAndTopic(topicNoID, addTopicWithIDToTaggedResource);
      }
    })
    .catch((err) =>
      console.error(
        `field ${topicNoID.microsoftID} is not in database and could not be created ${err}`
      )
    );
}

export function addTopicsToResource(
  topics: TaggedTopic[],
  resourceID: string,
  resourceType: string
) {
  const topicsPromises = topics.map(async (topic) => {
    const resourceTopic: Topic = {
      name: topic.name,
      normalisedName: topic.normalisedName,
      rank: 1,
      microsoftID: topic.microsoftID,
    };
    let topicID: string;
    if (!topic.id) {
      const collectedTopics: TaggedTopic[] = [];
      await addTopicIDToTaggedTopic(topic, collectedTopics);
      if (collectedTopics[0]) {
        topicID = collectedTopics[0].id;
      } else {
        return;
      }
    } else {
      topicID = topic.id;
    }
    if (resourceType !== 'group' && resourceType !== 'user') return;
    let resourceTopicRef: firestore.DocumentReference;
    if (resourceType === 'group')
      resourceTopicRef = db.doc(`groups/${resourceID}/topics/${topicID}`);
    else resourceTopicRef = db.doc(`users/${resourceID}/topics/${topicID}`);
    return resourceTopicRef
      .get()
      .then((ds: firestore.DocumentSnapshot) => {
        if (!ds.exists) {
          return resourceTopicRef
            .set(resourceTopic)
            .catch((err) =>
              console.error(
                'could not add topic with id ' +
                  resourceTopic.id +
                  ' to ' +
                  resourceType +
                  ' with id ' +
                  resourceID,
                err
              )
            );
        } else {
          return resourceTopicRef
            .update({
              rank: firestore.FieldValue.increment(1),
            })
            .catch((err) =>
              console.error(
                'could not increase rank of topic with id ' +
                  resourceTopic.id +
                  ' while adding content to ' +
                  resourceType +
                  ' with id ' +
                  resourceID,
                err
              )
            );
        }
      })
      .catch((err) =>
        console.error(
          'could not fetch topic with id ' +
            resourceTopic.id +
            ' while adding content to ' +
            resourceType +
            ' with id ' +
            resourceID,
          err
        )
      );
  });
  return Promise.all(topicsPromises);
}

export async function removeTopicsFromResource(
  topics: TaggedTopic[],
  resourceID: string,
  resourceType: string
) {
  const topicsPromises = topics.map(async (topic) => {
    let topicID: string;
    if (!topic.id) {
      const collectedTopics: TaggedTopic[] = [];
      await addTopicIDToTaggedTopic(topic, collectedTopics);
      if (collectedTopics[0]) {
        topicID = collectedTopics[0].id;
      } else {
        return;
      }
    } else {
      topicID = topic.id;
    }
    if (resourceType !== 'group' && resourceType !== 'user') return;
    let resourceTopicRef: firestore.DocumentReference;
    if (resourceType === 'group')
      resourceTopicRef = db.doc(`groups/${resourceID}/topics/${topicID}`);
    else resourceTopicRef = db.doc(`users/${resourceID}/topics/${topicID}`);

    return resourceTopicRef
      .get()
      .then((qs: any) => {
        if (!qs.exists) return;
        const topicRank = qs.data().rank;
        if (!topicRank || topicRank === 1) {
          resourceTopicRef
            .delete()
            .catch((err) =>
              console.error(
                'could not delete topic with id ' +
                  topic.id +
                  ' on ' +
                  resourceType +
                  ' with id ' +
                  resourceID,
                err
              )
            );
        } else {
          resourceTopicRef
            .update({rank: topicRank - 1})
            .catch((err) =>
              console.error(
                'could not decrease rank of topic with id ' +
                  topic.id +
                  ' on ' +
                  resourceType +
                  ' with id ' +
                  resourceID,
                err
              )
            );
        }
      })
      .catch((err) =>
        console.error(
          'could not fetch topic with id ' +
            topic.id +
            ' on ' +
            resourceType +
            ' with id ' +
            resourceID +
            ' while removing content from the ' +
            resourceType +
            '.',
          err
        )
      );
  });
  return Promise.all(topicsPromises);
}

export const recordDuplicateTopic = functions.firestore
  .document(`topics/{topicID}`)
  .onCreate(async (doc, context) => {
    const topicID = context.params.topicID;
    const topicData = doc.data();
    const microsoftTopicID = topicData.microsoftID;
    const correspondingMSField = await db
      .doc(`MSFields/${microsoftTopicID}`)
      .get()
      .catch((err) =>
        console.error(
          `unable to check if topic with id ${topicID} is a duplicate ${err}`
        )
      );
    if (!correspondingMSField || !correspondingMSField.exists) return;
    const correspondingMSFieldData = correspondingMSField.data()! as MAKField;
    const processedID = correspondingMSFieldData.processed;
    if (processedID !== topicID)
      return db.doc(`duplicateTopics/${topicID}`).set(topicData);
    return;
  });

export const addRecentPostsToFeedOnNewTopicFollow = functions.firestore
  .document(`topics/{followedTopicID}/followedByUsers/{followerID}`)
  .onCreate(
    async (_, context): Promise<void[]> => {
      const followerID = context.params.followerID;
      const followedTopicID = context.params.followedTopicID;
      return await addRecentPostsToFollowingFeed(
        followerID,
        db.collection(`topics/${followedTopicID}/posts`)
      );
    }
  );

export const addTopicPostToFollowersFeeds = functions.firestore
  .document(`topics/{topicID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const topicID = context.params.topicID;
    const postID = context.params.postID;
    const post = change.data() as Post;
    const topicFollowersCollectionRef = db.collection(
      `topics/${topicID}/followedByUsers`
    );
    return topicFollowersCollectionRef
      .get()
      .then((qs) => {
        if (qs.empty) return;
        const topicFollowersIDs: string[] = [];
        qs.forEach((doc) => {
          const followerData = doc.data();
          const omittedPostTypes: Array<FollowPostTypePreferences> =
            followerData.omittedPostTypes;
          let postIsBlockedByFollowPreferences = false;
          if (omittedPostTypes && omittedPostTypes.length > 0) {
            if (
              doFollowPreferencesBlockPost('postTypes', post, omittedPostTypes)
            )
              postIsBlockedByFollowPreferences = true;
          }
          if (postIsBlockedByFollowPreferences) return;
          topicFollowersIDs.push(doc.id);
        });
        const topicFollowersPromisesArray = topicFollowersIDs.map(
          async (topicFollowerID) => {
            const userPostsDocRef = db.doc(
              `users/${topicFollowerID}/feeds/followingFeed/posts/${postID}`
            );
            const batch = db.batch();
            batch.set(userPostsDocRef, post);
            batch.set(
              db.doc(
                `posts/${postID}/onFollowingFeedsOfUsers/${topicFollowerID}`
              ),
              {id: topicFollowerID}
            );
            return batch
              .commit()
              .catch((err) =>
                console.log(
                  'failed to add posts from topic with id ' +
                    topicID +
                    ' to following feed of user with id ' +
                    topicFollowerID,
                  err
                )
              );
          }
        );
        return Promise.all(topicFollowersPromisesArray);
      })
      .catch((err) => console.log(err, 'could not fetch followers of topic'));
  });

export const addTopicPostsToFollowingFeeds = functions.firestore
  .document(`topics/{topicID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const topicID = context.params.topicID;
    const postID = context.params.postID;
    const post = change.data() as Post;
    const topicFollowersCollectionRef = db.collection(
      `topics/${topicID}/followedByUsers`
    );

    const updateFollowersOfTopic = async () => {
      return topicFollowersCollectionRef
        .get()
        .then((qs) => {
          const topicFollowers = [] as UserRef[];
          qs.forEach((doc) => {
            topicFollowers.push(doc.data() as UserRef);
          });
          const topicFollowersPromisesArray = topicFollowers.map(
            async (topicFollower) => {
              const userID = topicFollower.id;
              const userPostsDocRef = db.doc(
                `users/${userID}/feeds/followingFeed/posts/${postID}`
              );
              return userPostsDocRef
                .set(post)
                .catch((err) =>
                  console.log(
                    err,
                    'failed to add posts from topic to user following feed'
                  )
                );
            }
          );
          return Promise.all(topicFollowersPromisesArray);
        })
        .catch((err) => console.log(err, 'could not fetch followers of topic'));
    };
    return updateFollowersOfTopic();
  });

export const updateTopicFilterOnNewPost = functions.firestore
  .document('topics/{topicID}/posts/{postID}')
  .onCreate((postDS, context) => {
    const post = postDS.data() as Post;
    const topicID = context.params.topicID;
    return updateFiltersByPost(
      db.doc(`topics/${topicID}/feeds/postsFeed`),
      post,
      true
    );
  });

export const updateTopicFilterOnDeletedPost = functions.firestore
  .document('topics/{topicID}/posts/{postID}')
  .onDelete((postDS, context) => {
    const post = postDS.data() as Post;
    const topicID = context.params.topicID;
    return updateFilterCollection(
      db.doc(`topics/${topicID}/feeds/postsFeed`),
      {resourceName: 'Post Type', resourceType: ResourceTypes.POST_TYPE},
      {
        name: post.postType.name,
        id: post.postType.id,
      },
      true
    );
  });

export function azureTopicToTopicNoID(azureTopic: AzureTopicResult): Topic {
  const capitaliseFirstLetter = (string: string) =>
    string[0].toUpperCase() + string.slice(1);
  return {
    microsoftID: azureTopic.id,
    name: capitaliseFirstLetter(azureTopic.name),
    normalisedName: azureTopic.name,
  };
}

// Rank relates to how often the resource mentions this topic
export interface Topic {
  id?: string;
  microsoftID: string;
  name: string;
  normalisedName: string;
  rank?: number;
}

export interface TaggedTopic {
  id: string;
  microsoftID: string;
  name: string;
  normalisedName: string;
}

export interface AzureTopicResult {
  ['@search.score']: number;
  id: string;
  name: string;
}
