import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {
  PublicationRef,
  toPublicationRef,
  getPublicationByMicrosoftPublicationID,
} from './publications';

import {UserRef, checkAuthAndGetUserFromContext} from './users';
import {
  TaggedTopic,
  convertTaggedTopicToTopic,
  handleTopicsNoID,
} from './topics';

const db = admin.firestore();

db.settings({
  ignoreUndefinedProperties: true,
});

export const createPost = functions.https.onCall(async (data, context) => {
  const author = await checkAuthAndGetUserFromContext(context);
  const postDocRef = db.collection('posts').doc();
  const postID = postDocRef.id;

  const content: PostContent = {
    text: data.title,
  };

  const postTopics: TaggedTopic[] = [];
  const matchedTopicsPromises = await handleTopicsNoID(data.topics, postTopics);
  await Promise.all(matchedTopicsPromises);

  if (data.publication) {
    const publicationDS = await getPublicationByMicrosoftPublicationID(
      data.publication.microsoftID,
      true
    );
    data.publication.id = publicationDS.id;

    if (!data.publication.id) {
      throw new functions.https.HttpsError(
        'internal',
        'An error occured while creating the post.'
      );
      return;
    }
  }
  const post: Post = {
    postType: data.postType,
    author: author,
    content: content,
    topics: postTopics,
    customTopics: data.customTopics,
    timestamp: new Date(),
    unixTimeStamp: new Date().getTime() / 1000,
    filterTopicIDs: postTopics.map(
      (taggedTopic: TaggedTopic) => taggedTopic.id
    ),
    id: postID,
  };
  if (data.publication) {
    post.publication = toPublicationRef(data.publication, data.publication.id);
  }
  if (data.publicationURL) post.publicationURL = data.publicationURL;
  await Promise.all(matchedTopicsPromises);
  return postDocRef.set(post).catch((err) => {
    console.error(`could not create post ${postID}` + err);
    throw new functions.https.HttpsError(
      'internal',
      'An error occured while creating the post.'
    );
  });
});

export const addPostToAuthorPosts = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const postID = change.id;
    const authorID = post.author.id;
    await db
      .collection('users')
      .doc(authorID)
      .collection('posts')
      .doc(postID)
      .set(post);
    return null;
  });

export const updatePostOnAuthors = functions.firestore
  .document(`posts/{postID}`)
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = change.after.id;
    const authorID = newPostData.author.id;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;

    await db
      .collection('users')
      .doc(authorID)
      .collection('posts')
      .doc(postID)
      .set(newPostData);
    return null;
  });

export const updatePostOnGroups = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;

    const groupsQS = await db
      .collection(`posts/${postID}/groups`)
      .get()
      .catch((err) =>
        console.error('unable to fetch groups for post with id ' + postID, err)
      );
    if (!groupsQS || groupsQS.empty) return;
    const groupsIDs: string[] = [];
    groupsQS.forEach((ds) => {
      const groupID = ds.id;
      groupsIDs.push(groupID);
    });
    const groupsUpdatePromise = groupsIDs.map(async (groupID) => {
      return db
        .doc(`groups/${groupID}/posts/${postID}`)
        .set(newPostData)
        .catch((err) =>
          console.error(
            'unable to update post on group with id ' +
              groupID +
              ' for post with id ' +
              postID,
            err
          )
        );
    });
    return Promise.all(groupsUpdatePromise);
  });

export const updatePostOnPublication = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;
    const publication = newPostData.publication;
    if (!publication || !publication.id) return;
    return db
      .doc(`publications/${publication.id}/posts/${postID}`)
      .set(newPostData)
      .catch((err) =>
        console.error(
          'unable to update post on publication with id ' +
            publication.id +
            ' for post with id ' +
            postID,
          err
        )
      );
  });

export const updatePostOnBookmarks = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;
    const bookmarkersQS = await db
      .collection(`posts/${postID}/bookmarkedBy`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch bookmarkers of post with id ' + postID,
          err
        )
      );
    if (!bookmarkersQS || bookmarkersQS.empty) return;
    const bookmarkersIDs: string[] = [];
    bookmarkersQS.forEach((ds) => {
      const bookmarkerID = ds.id;
      bookmarkersIDs.push(bookmarkerID);
    });
    const bookmarkersUpdatePromise = bookmarkersIDs.map(
      async (bookmarkerID) => {
        return db
          .doc(`users/${bookmarkerID}/bookmarks/${postID}`)
          .update({bookmarkedResourceData: newPostData})
          .catch((err) =>
            console.error(
              'unable to update post on bookmarker with id ' +
                bookmarkerID +
                ' for post with id ' +
                postID,
              err
            )
          );
      }
    );
    return Promise.all(bookmarkersUpdatePromise);
  });

export const updatePostOnRecommenders = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;
    const recommendersQS = await db
      .collection(`posts/${postID}/recommendedBy`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch recommenders of post with id ' + postID,
          err
        )
      );
    if (!recommendersQS || recommendersQS.empty) return;
    const recommendersIDs: string[] = [];
    recommendersQS.forEach((ds) => {
      const recommenderID = ds.id;
      recommendersIDs.push(recommenderID);
    });
    const recommendersUpdatePromise = recommendersIDs.map(
      async (recommenderID) => {
        return db
          .doc(`users/${recommenderID}/recommendations/${postID}`)
          .update({recommendedResourceData: newPostData})
          .catch((err) =>
            console.error(
              'unable to update post on recommender with id ' +
                recommenderID +
                ' for post with id ' +
                postID,
              err
            )
          );
      }
    );
    return Promise.all(recommendersUpdatePromise);
  });

export const updatePostOnTopic = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;
    const topics = newPostData.topics;
    if (!topics || topics.length === 0) return;
    const topicsUpdatePromise = topics.map(async (topic) =>
      db
        .doc(`topics/${topic.id}/posts/${postID}`)
        .set(newPostData)
        .catch((err) =>
          console.error(
            'unable to update post on topic with id ' +
              topic.id +
              ' for post with id ' +
              postID,
            err
          )
        )
    );
    return Promise.all(topicsUpdatePromise);
  });

export const updatePostOnFollowerFeeds = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(PostToPostRef(newPostData)) ===
      JSON.stringify(PostToPostRef(oldPostData))
    )
      return;
    const appearsOnFollowerFeedsQS = await db
      .collection(`posts/${postID}/onFollowingFeedsOfUsers`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch user IDs for those following feeds that have post with id ' +
            postID,
          err
        )
      );
    if (!appearsOnFollowerFeedsQS || appearsOnFollowerFeedsQS.empty) return;
    const followersIDs: string[] = [];
    appearsOnFollowerFeedsQS.forEach((ds) => {
      followersIDs.push(ds.id);
    });
    const followersPromises = followersIDs.map((followerID) =>
      db
        .doc(`users/${followerID}/feeds/followingFeed/posts/${postID}`)
        .set(newPostData)
    );
    return Promise.all(followersPromises);
  });

// When a user starts following a new resource, they will not initially see any
// of that resource's posts in their following feed as the resource will
// probably not have posted since the user started following it. This is not
// engaging for new users as it means their following feed will be entirely
// empty. To make the new user experience more engaging we add the most recent
// posts from that resource into the following feed.
const POSTS_TO_ADD_ON_NEW_FOLLOW = 2;
export async function addRecentPostsToFollowingFeed(
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
    const postID = postDS.id;
    const batch = db.batch();
    // Not important if we fail to add past posts to the feed.
    batch.set(
      db.doc(`users/${followerID}/feeds/followingFeed/posts/${postID}`),
      post
    );
    batch.set(db.doc(`posts/${postID}/onFollowingFeedsOfUsers/${followerID}`), {
      id: followerID,
    });
    const postAddedPromise = batch
      .commit()
      .then(() => {
        return;
      })
      .catch((err) =>
        console.error(
          `Unable to add post ${postID} to the following feed of user ${followerID}:`,
          err
        )
      );
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

export const addPublicationPostToPublication = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change) => {
    const postID = change.id;
    const post = change.data() as Post;
    const publication = post.publication;
    if (!publication) return;
    return db
      .doc(`publications/${publication.id}/posts/${postID}`)
      .set(post)
      .catch((err) =>
        console.error(
          'unable to set post with id ' +
            postID +
            ' on publication with id ' +
            publication.id,
          err
        )
      );
  });

export async function updateFiltersByPost(
  feedRef: firestore.DocumentReference<firestore.DocumentData>,
  post: Post
) {
  await updateFilterCollection(
    feedRef,
    {
      resourceName: 'Post Type',
      resourceType: ResourceTypes.POST_TYPE,
    },
    {
      name: post.postType.name,
      id: post.postType.id,
    },
    false
  );
  await updateFilterCollection(
    feedRef,
    {
      resourceName: 'Author',
      resourceType: ResourceTypes.USER,
    },
    {
      name: post.author.name,
      id: post.author.id,
    },
    false
  );

  const topicFilterUpdatePromisesArray = post.topics.map(
    (taggedTopic: TaggedTopic) => {
      return updateFilterCollection(
        feedRef,
        {
          resourceName: 'Topics',
          resourceType: ResourceTypes.TOPIC,
        },
        {
          name: taggedTopic.name,
          id: taggedTopic.id,
        },
        false
      );
    }
  );
  await Promise.all(topicFilterUpdatePromisesArray).catch((err) =>
    console.error(
      `could not add topics from post with id ${post.id} to following feed filter for ${feedRef}, ${err}`
    )
  );
}

export async function updateFilterCollection(
  feedRef: firestore.DocumentReference<firestore.DocumentData>,
  filterCollection: FilterCollection,
  filterOption: FilterOption,
  removedResource?: boolean
): Promise<void> {
  const filterCollectionDocRef = feedRef
    .collection('filterCollections')
    .doc(filterCollection.resourceType);
  const filterOptionDocRef = filterCollectionDocRef
    .collection('filterOptions')
    .doc(filterOption.id);
  const filterCollectionExists = await filterCollectionDocRef
    .get()
    .then(async (ds) => {
      if (!ds.exists) {
        const setCollection = await filterCollectionDocRef
          .set(filterCollection)
          .then(() => true)
          .catch(() => false);
        return setCollection;
      }
      return true;
    })
    .catch((err) => console.error('unable to fetch filter collection', err));
  if (!filterCollectionExists) return;
  const fetchedFilterOptionDoc = await filterOptionDocRef
    .get()
    .catch((err) => console.error('unable to fetch filter option', err));
  if (!fetchedFilterOptionDoc) return;

  if (removedResource) {
    if (!fetchedFilterOptionDoc.exists) {
      console.log('could not find filter option');
      return;
    }
    const filterOptionData = fetchedFilterOptionDoc.data() as FilterOption;
    const filterOptionRank = filterOptionData.rank;
    const batchDB = db.batch();
    if (!filterOptionRank || filterOptionRank === 1) {
      batchDB.delete(filterOptionDocRef);
    } else {
      batchDB.update(filterOptionDocRef, {rank: filterOptionRank - 1});
    }
    batchDB.update(filterCollectionDocRef, {
      rank: firestore.FieldValue.increment(-1),
    });
    return batchDB
      .commit()
      .then(() => {
        return;
      })
      .catch((err) =>
        console.log(
          'unable to decrement or delete filter option and filter collection.',
          err
        )
      );
  }

  if (!fetchedFilterOptionDoc.exists) {
    const setFilterOption = await filterOptionDocRef
      .set(filterOption)
      .then(() => true)
      .catch((err) => {
        console.error('unable to set new filter option', err);
        return false;
      });
    if (!setFilterOption) return;
  }
  // increment the rank of the filter collection and option
  const batch = db.batch();
  batch.update(filterCollectionDocRef, {
    rank: firestore.FieldValue.increment(1),
  });
  batch.update(filterOptionDocRef, {rank: firestore.FieldValue.increment(1)});
  return batch
    .commit()
    .then(() => {
      return;
    })
    .catch((err) =>
      console.error('could not update rank of collection and doc', err)
    );
}

export async function updateRefOnFilterCollection(
  filterOptionRef: firestore.DocumentReference<firestore.DocumentData>,
  newFilterOption: FilterOption
) {
  return filterOptionRef.set(newFilterOption, {merge: true});
}

// This also triggers the user to be added to the topic with the same rank
export const linkPostTopicsToAuthor = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const postTopics = post.topics;
    const authorID = post.author.id;
    postTopics.forEach((postTopic) => {
      // this should not be possible
      if (!postTopic.id) {
        console.error('post topic found with no id');
        return;
      }
      const userTopicDocRef = db.doc(
        `users/${authorID}/topics/${postTopic.id}`
      );
      userTopicDocRef
        .get()
        .then((qs: any) => {
          if (!qs.exists) {
            const userTopic = convertTaggedTopicToTopic(postTopic, true);
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

interface FilterOption {
  name: string;
  id: string;
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
  publicationURL?: string[];
  publication?: PublicationRef;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
  bookmarkedCount?: number;
  recommendedCount?: number;
  unixTimeStamp: number;
}

export interface PostRef {
  postType: PostType;
  author: UserRef;
  content: PostContent;
  topics: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  id: string;
  publicationURL?: string[];
  publication?: PublicationRef;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
  unixTimeStamp: number;
}

export function PostToPostRef(post: Post): PostRef {
  delete post.bookmarkedCount;
  delete post.recommendedCount;
  return post;
}

export interface PostContent {
  text: string;
}

export interface PostType {
  id: string;
  name: string;
}
