import * as functions from 'firebase-functions';
import {v4 as uuid} from 'uuid';

import {admin, ResourceTypes} from './config';
import { firestore } from 'firebase-admin';

const db: firestore.Firestore = admin.firestore();

export const createPost = functions.https.onCall(async (data, context) => {
  if (context.auth === undefined) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to create a post');
  }

  const userID = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(userID).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  const userData = userDoc.data();
  const author: UserRef = {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar,
  }

  const post: Post = {
    title: data.title,
    postType: {
      id: 'default',
      name: 'default',
    },
    author: author,
    content: {
      text: data.title,
    },
    topics: [],
    timestamp: new Date(),
    filterAuthorID: author.id,
    filterPostTypeID: 'default',
    filterTopicIDs: [],
  };
  const postID = uuid();

  const batch = db.batch();
  batch.set(db.collection('posts').doc(postID), post);
  batch.set(db.collection('users').doc(userID).collection('posts').doc(postID), post);
  await batch.commit();
});

export const addPostToUserFollowingFeeds = functions.firestore.document(`posts/{postID}`)
    .onCreate(async (change, context) => {
        const postID = change.id;
        const post = change.data() as Post;
        const authorID = post.author.id;
        const followers = await db.collection(`users/${authorID}/followedByUsers`).get();
        if (followers.empty) {
            return;
        }
        followers.forEach(async (followerSnapshot) => {
            const follower = followerSnapshot.data() as UserRef;
            const followingFeedRef = db.doc(`users/${follower.id}/feeds/followingFeed`);
            await followingFeedRef.collection('posts').doc(postID).set(post);
            await updateFiltersByPost(followingFeedRef, post);
        });
    });

async function updateFiltersByPost(followingFeedRef: firestore.DocumentReference<firestore.DocumentData>, post: Post) {
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
    );
    // TODO(#146): Add topics to the filter 
}

async function updateFilterCollection(feedRef: firestore.DocumentReference<firestore.DocumentData>, filterCollection: FilterCollection, filterOption: FilterOption) {
  const filterCollectionDocRef = feedRef.collection("filterCollections").doc(filterCollection.resourceType);
  // create the filter collection if it doesn't exist
  await filterCollectionDocRef.set(filterCollection, {merge: true});
  
  const filterOptionDocRef = filterCollectionDocRef.collection("filterOptions").doc(filterOption.resourceID);
  // create the filter option if it doesn't exist
  await filterOptionDocRef.set(filterOption, {merge: true});

  // increment the rank of the filter collection and option
  await filterCollectionDocRef.update({rank: firestore.FieldValue.increment(1)});
  await filterOptionDocRef.update({rank: firestore.FieldValue.increment(1)});
}

interface FilterOption {
    name: string,
    avatar?: string,
    resourceID: string,
    rank?: number,
}

interface FilterCollection {
    resourceName: string,
    resourceType: ResourceTypes,
    rank?: number,
}

interface Post {
  title: string;
  postType: PostType;
  author: UserRef;
  content: PostContent;
  topics: Topic[];
  timestamp: Date;

  // filterable fields
  filterPostTypeID: string;
  filterAuthorID: string;
  filterTopicIDs: string[];
}

interface Topic {
  id: string;
  name: string;
}

interface PostContent {
  text?: string;
  location?: string;
  methods?: Array<string>;
  startDate?: string;
  salary?: string;
  funder?: string;
  amount?: string;
  researchers?: Array<UserRef>;
}

interface PostType {
  id: string;
  name: string;
}

interface UserRef {
  id: string;
  name: string;
  avatar?: string;
}