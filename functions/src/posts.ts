import * as functions from 'firebase-functions';
import {v4 as uuid} from 'uuid';

import {admin} from './config';

const db = admin.firestore();

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