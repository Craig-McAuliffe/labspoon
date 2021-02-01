import * as functions from 'firebase-functions';
import {Post, updateFiltersByPost} from './posts';
import {admin} from './config';
import {toUserFilterRef} from './users';
const db = admin.firestore();

export const updateFollowFilterOnNewPost = functions.firestore
  .document('users/{userID}/feeds/followingFeed/posts/{postID}')
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const userID = context.params.userID;
    return updateFiltersByPost(
      db.doc(`users/${userID}/feeds/followingFeed`),
      post
    );
  });

export const updateUserFilterFromPost = functions.firestore
  .document('users/{userID}/feeds/followingFeed/posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const newAuthorName = newPostData.author.name;
    const oldAuthorName = oldPostData.author.name;
    if (newAuthorName === oldAuthorName) return;
    const userID = context.params.userID;
    const authorID = newPostData.author.id;
    const authorFilterOptionDBPath = db.doc(
      `users/${userID}/feeds/followingFeed/filterCollections/user/filterOptions/${authorID}`
    );
    return await authorFilterOptionDBPath.set(
      toUserFilterRef(newAuthorName, authorID),
      {merge: true}
    );
  });
