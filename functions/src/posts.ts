import * as functions from 'firebase-functions';
import {v4 as uuid} from 'uuid';
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

  const postID = uuid();

  const content: PostContent = {
    text: data.title,
  };

  const postTopics: TaggedTopic[] = [];
  const matchedTopicsPromises = handleTopicsNoID(data.topics, postTopics);
  await Promise.all(matchedTopicsPromises);

  if (data.publication) {
    const publicationDS = await getPublicationByMicrosoftPublicationID(
      data.publication.microsoftID!,
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
  return db
    .runTransaction((transaction) => {
      const post: Post = {
        postType: data.postType,
        author: author,
        content: content,
        topics: postTopics,
        customTopics: data.customTopics,
        timestamp: new Date(),
        filterTopicIDs: postTopics.map(
          (taggedTopic: TaggedTopic) => taggedTopic.id
        ),
        id: postID,
      };
      if (data.publication) {
        post.publication = toPublicationRef(
          data.publication,
          data.publication.id
        );
      }
      if (data.publicationURL) post.publicationURL = data.publicationURL;
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

export const updatePostOnGroup = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const postID = context.params.postID;
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
    const postID = context.params.postID;
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

export const updatePostOnTopic = functions.firestore
  .document('posts/{postID}')
  .onUpdate(async (change, context) => {
    const newPostData = change.after.data() as Post;
    const postID = context.params.postID;
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
    // Not important if we fail to add past posts to the feed.
    const postAddedPromise = db
      .doc(`users/${followerID}/feeds/followingFeed/posts/${post.id}`)
      .set(post)
      .then(() =>
        updateFiltersByPost(
          db.doc(`users/${followerID}/feeds/followingFeed`),
          post
        )
      )
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

  const topicFilterUpdatePromisesArray = post.topics.map(
    (taggedTopic: TaggedTopic) => {
      return updateFilterCollection(
        followingFeedRef,
        {
          resourceName: 'Topics',
          resourceType: ResourceTypes.TOPIC,
        },
        {
          name: taggedTopic.name,
          resourceID: taggedTopic.id,
        },
        false
      );
    }
  );
  await Promise.all(topicFilterUpdatePromisesArray).catch((err) =>
    console.error(
      `could not add topics from post with id ${post.id} to following feed filter for ${followingFeedRef}, ${err}`
    )
  );
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
      const userTopic = convertTaggedTopicToTopic(postTopic, true);
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
  publicationURL?: string[];
  publication?: PublicationRef;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
}

export interface PostContent {
  text: string;
}

export interface PostType {
  id: string;
  name: string;
}
