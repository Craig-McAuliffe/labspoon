import * as functions from 'firebase-functions';
import {v4 as uuid} from 'uuid';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';

import {UserRef} from './users';
import {Publication, MAKField, makFieldToTopic} from './microsoft';
import {Topic, TaggedTopic, createFieldAndTopic} from './topics';

const db = admin.firestore();

db.settings({
  ignoreUndefinedProperties: true,
});

export const createPost = functions.https.onCall(async (data, context) => {
  if (context.auth === undefined) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to create a post'
    );
  }

  const userID = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(userID).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  const userData = userDoc.data()!;
  const author: UserRef = {
    id: userData.id,
    name: userData.name,
    avatar: userData.avatar,
  };

  const postID = uuid();

  const content: PostContent = {
    text: data.title,
    position: data.position,
    location: data.location,
    salary: data.salary,
    methods: data.methods,
    startDate: data.startDate,
  };

  if (data.publication) content.publication = data.publication;
  if (data.publicationURL) content.publicationURL = data.publicationURL;

  const postTopics: TaggedTopic[] = [];
  const matchedTopicsPromises = data.topics.map((taggedTopic: Topic) => {
    return db
      .doc(`MSFields/${taggedTopic.microsoftID}`)
      .get()
      .then(async (ds) => {
        const addTopicToPost = (correspondingLabspoonTopicID: string) => {
          postTopics.push({
            name: taggedTopic.name,
            microsoftID: taggedTopic.microsoftID,
            normalisedName: taggedTopic.normalisedName,
            id: correspondingLabspoonTopicID,
          });
        };

        if (!ds.exists) {
          await createFieldAndTopic(taggedTopic)
            .then(async (labspoonTopicID) => {
              if (labspoonTopicID !== undefined) {
                addTopicToPost(labspoonTopicID);
              } else {
                await db
                  .doc(`MSFields/${taggedTopic.microsoftID}`)
                  .get()
                  .then((ds) => {
                    if (!ds.exists) {
                      console.error(
                        `could not connect Tagged topic with microsoftID ${taggedTopic.microsoftID} on post ${postID} to newly created topic`
                      );
                      return undefined;
                    } else {
                      const dbMSField = ds.data() as MAKField;
                      addTopicToPost(dbMSField.processed);
                      return true;
                    }
                  })
                  .catch((err) => {
                    console.error(
                      `could not connect Tagged topic with microsoftID ${taggedTopic.microsoftID} on post ${postID} to newly created topic. ${err}`
                    );
                  });
              }
            })
            .catch((err) =>
              console.error(
                `field ${taggedTopic.microsoftID} is not in database and could not be created ${err}`
              )
            );
        } else {
          const dbMSField = ds.data() as MAKField;
          addTopicToPost(dbMSField.processed);
          if (!dbMSField.processed) {
            // This should not be possible. All dbMSFields should be processed
            // upon creation.
            console.error(
              'no Labspoon topic corresponding to MSField ' +
                taggedTopic.microsoftID
            );
            await db.collection('topics').doc().set(makFieldToTopic(dbMSField));
          }
        }
      });
  });

  await Promise.all(matchedTopicsPromises);
  return db
    .runTransaction((transaction) => {
      const post: Post = {
        postType: data.postType,
        author: author,
        content: content,
        topics: postTopics,
        customTopics: data.customTopics,
        timestamp: new Date(),
        filterAuthorID: author.id,
        filterPostTypeID: 'default',
        filterTopicIDs: data.topics.map(
          (taggedTopic: {id: string; name: string}) => taggedTopic.id
        ),
        id: postID,
      };
      return Promise.all(matchedTopicsPromises).then(() => {
        transaction.set(db.collection('posts').doc(postID), post);
      });
    })
    .catch((err) => {
      console.error(`could not create post ${postID}` + err);
      throw new functions.https.HttpsError(
        'internal',
        'An error occured while creating the post.'
      );
    });
});

export const writePostToAuthorPosts = functions.firestore
  .document(`posts/{postID}`)
  .onWrite(async (change, context) => {
    if (
      context.eventType ===
      'providers/google.firebase.database/eventTypes/ref.delete'
    )
      return null;
    const post = change.after.data() as Post;
    const postID = change.after.id;
    const authorID = post.author.id;
    await db
      .collection('users')
      .doc(authorID)
      .collection('posts')
      .doc(postID)
      .set(post);
    return null;
  });

export const writePostToUserFollowingFeeds = functions.firestore
  .document(`posts/{postID}`)
  .onWrite(async (change, context) => {
    if (
      context.eventType ===
      'providers/google.firebase.database/eventTypes/ref.delete'
    )
      return null;
    const post = change.after.data() as Post;
    const postID = change.after.id;
    const followers = await db
      .collection(`users/${post.author.id}/followedByUsers`)
      .get();
    if (followers.empty) return null;
    followers.forEach(async (followerSnapshot) => {
      const follower = followerSnapshot.data() as UserRef;
      const followingFeedRef = db.doc(
        `users/${follower.id}/feeds/followingFeed`
      );
      await followingFeedRef.collection('posts').doc(postID).set(post);
      await updateFiltersByPost(followingFeedRef, post);
    });
    return null;
  });

export const addRecentPostsToFeedOnNewUserFollow = functions.firestore
  .document(`users/{followerID}/followsUsers/{followingID}`)
  .onCreate(
    async (_, context): Promise<void[]> => {
      const followerID = context.params.followerID;
      const followingID = context.params.followingID;

      try {
        return addRecentPostsToFollowingFeed(
          followerID,
          db.collection(`users/${followingID}/posts`)
        );
      } catch (err) {
        console.error(
          `Error while adding recent posts to the following feed of user ${followerID} who has just started following user ${followingID}`,
          err
        );
      }
      return new Promise(() => []);
    }
  );

export const addRecentPostsToFeedOnNewGroupFollow = functions.firestore
  .document(`users/{followerID}/followsGroups/{followingID}`)
  .onCreate(
    async (_, context): Promise<void[]> => {
      const followerID = context.params.followerID;
      const followingID = context.params.followingID;
      try {
        return addRecentPostsToFollowingFeed(
          followerID,
          db.collection(`groups/${followingID}/posts`)
        );
      } catch (err) {
        console.error(
          `Error while adding recent posts to the following feed of user ${followerID} who has just started following group ${followingID}`,
          err
        );
      }
      return new Promise(() => []);
    }
  );

export const addRecentPostsToFeedOnNewTopicFollow = functions.firestore
  .document(`users/{followerID}/followsTopics/{followingID}`)
  .onCreate(
    async (_, context): Promise<void[]> => {
      const followerID = context.params.followerID;
      const followingID = context.params.followingID;
      try {
        return addRecentPostsToFollowingFeed(
          followerID,
          db.collection(`topics/${followingID}/posts`)
        );
      } catch (err) {
        console.error(
          `Error while adding recent posts to the following feed of user ${followerID} who has just started following topic ${followingID}`,
          err
        );
      }
      return new Promise(() => []);
    }
  );

// When a user starts following a new resource, they will not intially see any
// of that resource's posts in their following feed as the resource will
// probably not have posted since the user started following it. This is not
// engaging for new users as it means their following feed will be entirely
// empty. To make the new user experience more engaging we add the most recents
// posts from that resource into the following feed.
const POSTS_TO_ADD_ON_NEW_FOLLOW = 2;
async function addRecentPostsToFollowingFeed(
  followerID: string,
  originCollection: firestore.CollectionReference
): Promise<void[]> {
  const posts = await originCollection
    .orderBy('timestamp', 'desc')
    .limit(POSTS_TO_ADD_ON_NEW_FOLLOW)
    .get()
    .catch((err) => {
      throw new Error(
        `Unable to retrieves posts from collection ${originCollection}: ${err}`
      );
    });
  if (posts.empty) new Promise(() => []);
  const postAddedPromises: Promise<void>[] = [];
  posts.forEach((postDS) => {
    const post = postDS.data() as Post;
    const followingFeedRef = db.doc(
      `users/${followerID}/feeds/followingFeed/posts/${post.id}`
    );
    // Not important if we fail to add past posts to the feed.
    const postAddedPromise = followingFeedRef
      .set(post)
      .then(() => updateFiltersByPost(followingFeedRef, post))
      .catch((err) => {
        console.error(
          `Unable to add post ${post.id} to the following feed of user ${followerID}:`,
          err
        );
      });
    postAddedPromises.push(postAddedPromise);
  });
  return Promise.all(postAddedPromises);
}

export const addPostToTopic = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data();
    const postID = context.params.postID;
    const postTopics = post.topics;
    const topicsToTopicsPromisesArray = postTopics.map(
      (postTopic: TaggedTopic) => {
        db.doc(`topics/${postTopic.id}/posts/${postID}`)
          .set(post)
          .catch((err) => console.log(err, 'could not add post to topic'));
      }
    );
    return Promise.all(topicsToTopicsPromisesArray);
  });

async function updateFiltersByPost(
  followingFeedRef: firestore.DocumentReference<firestore.DocumentData>,
  post: Post
) {
  await updateFilterCollection(
    followingFeedRef,
    {
      resourceName: 'Post Type',
      resourceType: ResourceTypes.POST_TYPE,
    },
    {
      name: post.postType.name,
      resourceID: post.postType.id,
    },
    false
  );
  await updateFilterCollection(
    followingFeedRef,
    {
      resourceName: 'Author',
      resourceType: ResourceTypes.USER,
    },
    {
      name: post.author.name,
      resourceID: post.author.id,
      avatar: post.author.avatar,
    },
    false
  );
  // TODO(#146): Add topics to the filter
}

export async function updateFilterCollection(
  feedRef: firestore.DocumentReference<firestore.DocumentData>,
  filterCollection: FilterCollection,
  filterOption: FilterOption,
  removedResource: boolean
) {
  const filterCollectionDocRef = feedRef
    .collection('filterCollections')
    .doc(filterCollection.resourceType);
  // create the filter collection if it doesn't exist
  await filterCollectionDocRef.set(filterCollection, {merge: true});

  const filterOptionDocRef = filterCollectionDocRef
    .collection('filterOptions')
    .doc(filterOption.resourceID);
  // create the filter option if it doesn't exist
  await filterOptionDocRef.set(filterOption, {merge: true});

  if (removedResource) {
    await filterOptionDocRef.get().then((qs) => {
      if (!qs.exists) {
        console.log('could not find filter option');
        return;
      }
      const filterOptionData = qs.data() as FilterOption;
      if (!filterOptionData.rank) return;
      const filterOptionRank = filterOptionData.rank;
      if (filterOptionRank === 1) {
        filterOptionDocRef
          .delete()
          .catch((err) => console.log(err, 'could not delete filter option'));
      } else {
        filterOptionDocRef
          .update({rank: filterOptionRank - 1})
          .catch((err) =>
            console.log(err, 'could not decrease filter option rank')
          );
      }
    });
    return;
  } else {
    // increment the rank of the filter collection and option
    await filterCollectionDocRef.update({
      rank: firestore.FieldValue.increment(1),
    });
    await filterOptionDocRef.update({rank: firestore.FieldValue.increment(1)});
    return;
  }
}
// This also triggers the user to be added to the topic with the same rank
export const linkPostTopicsToAuthor = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const postTopics = post.topics;
    const authorID = post.author.id;
    postTopics.forEach((postTopic) => {
      const userTopic = {
        name: postTopic.name,
        normalisedName: postTopic.normalisedName,
        rank: 1,
        microsoftID: postTopic.microsoftID,
      };
      const userTopicDocRef = db.doc(
        `users/${authorID}/topics/${postTopic.id}`
      );
      userTopicDocRef
        .get()
        .then((qs: any) => {
          if (!qs.exists) {
            userTopicDocRef
              .set(userTopic)
              .catch((err) =>
                console.log(err, 'could not link post topics to author')
              );
          } else {
            userTopicDocRef
              .update({
                rank: firestore.FieldValue.increment(1),
              })
              .catch((err) =>
                console.log(
                  err,
                  'could not update author topics ranks from post topics'
                )
              );
          }
        })
        .catch((err) => console.log(err, 'could not get user topic document'));
    });
  });

// This also triggers the group to be added to the topic with the same rank
export const addPostTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const postTopics = post.topics;
    const groupID = context.params.groupID;
    postTopics.forEach((postTopic) => {
      const groupTopic = {
        name: postTopic.name,
        normalisedName: postTopic.normalisedName,
        rank: 1,
        microsoftID: postTopic.microsoftID,
      };
      const groupTopicDocRef = db.doc(
        `groups/${groupID}/topics/${postTopic.id}`
      );
      return groupTopicDocRef.get().then((qs: any) => {
        if (!qs.exists) {
          groupTopicDocRef
            .set(groupTopic)
            .catch((err) =>
              console.log(err, 'could not link post topics to group')
            );
        } else {
          groupTopicDocRef
            .update({
              rank: firestore.FieldValue.increment(1),
            })
            .catch((err) =>
              console.log(
                err,
                'could not update group topics ranks from post topics'
              )
            );
        }
      });
    });
  });

// This also triggers the group to be added to the topic with the same rank
export const removePostTopicsFromGroup = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onDelete(async (change, context) => {
    const post = change.data() as Post;
    const postTopics = post.topics;
    const groupID = context.params.groupID;
    postTopics.forEach((postTopic) => {
      const groupTopicDocRef = db.doc(
        `groups/${groupID}/topics/${postTopic.id}`
      );
      return groupTopicDocRef
        .get()
        .then((qs: any) => {
          if (!qs.exists) return;
          const topicRank = qs.data().rank;
          if (topicRank === 1) {
            groupTopicDocRef
              .delete()
              .catch((err) =>
                console.log(err, 'could not delete topic on group')
              );
          } else {
            groupTopicDocRef
              .update({rank: topicRank - 1})
              .catch((err) =>
                console.log(err, 'could not decrease topic rank on group')
              );
          }
        })
        .catch((err) => console.log(err, 'could not fetch the group topic'));
    });
  });

interface FilterOption {
  name: string;
  avatar?: string;
  resourceID: string;
  rank?: number;
}

interface FilterCollection {
  resourceName: string;
  resourceType: ResourceTypes;
  rank?: number;
}

export interface Post {
  postType: PostType;
  author: UserRef;
  content: PostContent;
  topics: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  id: string;

  // filterable fields
  filterPostTypeID: string;
  filterAuthorID: string;
  filterTopicIDs: string[];
}

export interface PostContent {
  text?: string;
  location?: string;
  methods?: Array<string>;
  startDate?: string;
  salary?: string;
  funder?: string;
  amount?: string;
  researchers?: Array<UserRef>;
  publicationURL?: string;
  position?: string;
  publication?: Publication;
}

export interface PostType {
  id: string;
  name: string;
}
