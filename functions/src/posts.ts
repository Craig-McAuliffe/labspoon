import * as functions from 'firebase-functions';
import {v4 as uuid} from 'uuid';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';

import {UserRef} from './users';

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

  const post: Post = {
    postType: data.postType,
    author: author,
    content: {
      text: data.title,
      publicationURL: data.publicationURL,
      position: data.position,
      location: data.location,
      salary: data.salary,
      methods: data.methods,
      startDate: data.startDate,
    },
    topics: data.topics,
    timestamp: new Date(),
    filterAuthorID: author.id,
    filterPostTypeID: 'default',
    filterTopicIDs: data.topics.map(
      (taggedTopic: {id: string; name: string}) => taggedTopic.id
    ),
    id: postID,
  };

  const batch = db.batch();
  batch.set(db.collection('posts').doc(postID), post);
  batch.set(
    db.collection('users').doc(userID).collection('posts').doc(postID),
    post
  );
  await batch.commit();
});

export const addPostToUserFollowingFeeds = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change, context) => {
    const postID = change.id;
    const post = change.data() as Post;
    const authorID = post.author.id;
    const followers = await db
      .collection(`users/${authorID}/followedByUsers`)
      .get();
    if (followers.empty) {
      return;
    }
    followers.forEach(async (followerSnapshot) => {
      const follower = followerSnapshot.data() as UserRef;
      const followingFeedRef = db.doc(
        `users/${follower.id}/feeds/followingFeed`
      );
      await followingFeedRef.collection('posts').doc(postID).set(post);
      await updateFiltersByPost(followingFeedRef, post);
    });
  });

export const addPostToTopic = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data();
    const postID = context.params.postID;
    const postTopics = post.topics;
    postTopics.forEach((postTopic: Topic) => {
      postTopic.rank = 1;
      db.doc(`topics/${postTopic.id}/posts/${postID}`)
        .set(post)
        .catch((err) => console.log(err, 'could not add post to topic'));
    });
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
      postTopic.rank = 1;
      const userTopicDocRef = db.doc(
        `users/${authorID}/topics/${postTopic.id}`
      );
      userTopicDocRef
        .get()
        .then((qs: any) => {
          if (!qs.exists) {
            userTopicDocRef
              .set(postTopic)
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
      postTopic.rank = 1;
      const groupTopicDocRef = db.doc(
        `groups/${groupID}/topics/${postTopic.id}`
      );
      return groupTopicDocRef.get().then((qs: any) => {
        if (!qs.exists) {
          groupTopicDocRef
            .set(postTopic)
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
  topics: Topic[];
  timestamp: Date;
  id: string;

  // filterable fields
  filterPostTypeID: string;
  filterAuthorID: string;
  filterTopicIDs: string[];
}
// Rank relates to how often the resource mentions this topic
export interface Topic {
  id: string;
  name: string;
  rank?: number;
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
}

export interface PostType {
  id: string;
  name: string;
}
