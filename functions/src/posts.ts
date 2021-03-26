import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {
  PublicationRef,
  publicationToPublicationRef,
  getPublicationByMicrosoftPublicationID,
  customPublicationToCustomPublicationRef,
  CustomPublicationRef,
  CustomPublication,
  Publication,
} from './publications';
import {
  UserRef,
  checkAuthAndGetUserFromContext,
  User,
  UserStatsRef,
} from './users';
import {TaggedTopic, convertTaggedTopicToTopic} from './topics';
import {OpenPosition} from './openPositions';
import {ArticleBodyChild} from './researchFocuses';

const db = admin.firestore();

db.settings({
  ignoreUndefinedProperties: true,
});

const DAILY_POSTS_LIMIT = 60;

export const createPost = functions.https.onCall(async (data, context) => {
  const author = await checkAuthAndGetUserFromContext(context);
  await authorSpamCheck(author.id);

  const postDocRef = db.collection('posts').doc();
  const postID = postDocRef.id;

  if (data.publication && !data.publication.id) {
    if (data.isCustomPublication) {
      console.error(
        'post was created with a tagged custom publication but it does not have an ID. The id is therefore irretrievable'
      );
      throw new functions.https.HttpsError(
        'internal',
        'An error occured while creating the post. Tagged custom publication lacks an ID'
      );
    }
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
    text: data.title,
    topics: data.topics,
    customTopics: data.customTopics,
    timestamp: new Date(),
    unixTimeStamp: Math.floor(new Date().getTime() / 1000),
    filterTopicIDs: data.topics.map(
      (taggedTopic: TaggedTopic) => taggedTopic.id
    ),
    id: postID,
  };
  await authorLastPostTimeCheck(author.id, post.unixTimeStamp);
  if (data.publication) {
    if (data.publication.isCustomPublication)
      post.publication = customPublicationToCustomPublicationRef(
        data.publication as CustomPublication,
        data.publication.id
      );
    else
      post.publication = publicationToPublicationRef(
        data.publication as Publication,
        data.publication.id
      );
  }
  if (data.openPosition && data.openPosition.id)
    post.openPosition = data.openPosition;
  await postDocRef
    .set(post)
    .then(() =>
      db
        .doc(`usersStats/${post.author.id}`)
        .set({lastPostTimeStamp: post.unixTimeStamp})
        .catch((err) =>
          console.error(
            'unable to add recent post time stamp to user with id' +
              post.author.id +
              err
          )
        )
    )
    .catch((err) => {
      console.error(`could not create post ${postID}` + err);
      throw new functions.https.HttpsError(
        'internal',
        'An error occured while creating the post.'
      );
    });
  return post;
});

async function authorLastPostTimeCheck(
  authorID: string,
  postUnixTimeStamp: number
) {
  const lastPostTime = await db
    .doc(`usersStats/${authorID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return;
      const userDoc = ds.data() as User;
      return userDoc.lastPostTimeStamp;
    })
    .catch((err) =>
      console.error(
        `unable to check last post time for user with id ${authorID} ${err}`
      )
    );
  if (lastPostTime) {
    if (postUnixTimeStamp - lastPostTime < 10)
      throw new functions.https.HttpsError(
        'unavailable',
        'Must wait at least 10 seconds between creating posts.'
      );
  }
}

async function authorSpamCheck(authorID: string) {
  const activityData = await db
    .doc(`activity/postActivity/creators/${authorID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return;
      return ds.data() as UserStatsRef;
    })
    .catch((err) =>
      console.error('unable to check new post for spam author', err)
    );
  if (!activityData) return;
  if (activityData.dailyPostCount >= DAILY_POSTS_LIMIT)
    throw new functions.https.HttpsError(
      'unavailable',
      'Daily post limit reached.'
    );
}

export const addPostActivity = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change) => {
    const post = change.data() as Post;
    const authorID = post.author.id;
    const authorActivityRef = db.doc(
      `activity/postActivity/creators/${authorID}`
    );
    return Promise.resolve(
      authorActivityRef.set(
        {dailyPostCount: firestore.FieldValue.increment(1)},
        {merge: true}
      )
    );
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
      .set(postToPostRef(post));
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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

export const updatePostOnOpenPosition = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const oldPostData = change.before.data() as Post;
    const postID = context.params.postID;
    if (
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
    )
      return;
    const openPosition = newPostData.openPosition;
    if (!openPosition) return;
    return db
      .doc(`openPositions/${openPosition.id}/posts/${postID}`)
      .set(newPostData)
      .catch((err) =>
        console.error(
          'unable to update post on open position with id ' +
            openPosition.id +
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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
      JSON.stringify(postToPostRef(newPostData)) ===
      JSON.stringify(postToPostRef(oldPostData))
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
    const post = change.data() as Post;
    const postID = context.params.postID;
    const postTopics = post.topics;
    const topicsToTopicsPromisesArray = postTopics.map(
      (postTopic: TaggedTopic) => {
        db.doc(`topics/${postTopic.id}/posts/${postID}`)
          .set(postToPostRef(post))
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
      .set(postToPostRef(post))
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

export const addPostToOpenPosition = functions.firestore
  .document(`posts/{postID}`)
  .onCreate(async (change) => {
    const postID = change.id;
    const post = change.data() as Post;
    const openPosition = post.openPosition;
    if (!openPosition) return;
    return db
      .doc(`openPositions/${openPosition.id}/posts/${postID}`)
      .set(postToPostRef(post))
      .catch((err) =>
        console.error(
          'unable to set post with id ' +
            postID +
            ' on open position with id ' +
            openPosition.id,
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
  text: ArticleBodyChild[];
  topics: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  id: string;
  publication?: PublicationRef | CustomPublicationRef;
  openPosition?: OpenPosition;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
  bookmarkedCount?: number;
  recommendedCount?: number;
  unixTimeStamp: number;
}

export interface PostRef {
  postType: PostType;
  author: UserRef;
  text: ArticleBodyChild[];
  topics: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  id: string;
  publication?: PublicationRef | CustomPublicationRef;
  openPosition?: OpenPosition;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
  unixTimeStamp: number;
  unformattedText?: string;
}

export function postToPostRef(post: Post, isAlgolia?: boolean): PostRef {
  const postRef: PostRef = {
    postType: post.postType,
    author: post.author,
    text: post.text,
    topics: post.topics,
    timestamp: post.timestamp,
    filterTopicIDs: post.filterTopicIDs,
    unixTimeStamp: post.unixTimeStamp,
    id: post.id,
  };
  if (post.customTopics) postRef.customTopics = post.customTopics;
  if (post.publication) postRef.publication = post.publication;
  if (post.openPosition) postRef.openPosition = post.openPosition;
  if (isAlgolia)
    postRef.unformattedText = post.text.reduce(
      (accumulator, current) => accumulator + current.children[0].text + ' ',
      ''
    );
  return postRef;
}

export interface PostType {
  id: string;
  name: string;
}
