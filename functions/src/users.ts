import {firestore} from 'firebase-admin';
import * as functions from 'firebase-functions';
import {admin} from './config';
import {GroupRef} from './groups';
import {
  doFollowPreferencesBlockPost,
  FollowNoTopicsPreference,
  FollowPostTypePreferences,
} from './helpers';
import {MAKAuthor} from './microsoft';
import {OpenPosition} from './openPositions';
import {
  Post,
  updateRefOnFilterCollection,
  addRecentPostsToFollowingFeed,
  PostRef,
} from './posts';
import {PublicationRef} from './publications';
import {
  addTopicsToResource,
  removeTopicsFromResource,
  TaggedTopic,
  Topic,
} from './topics';

const db = admin.firestore();

const storage = admin.storage();

export const removeOldUserAvatarAndCoverPhoto = functions.firestore
  .document(`users/{userID}`)
  .onUpdate(async (change, context) => {
    const userID = context.params.userID;
    const oldUserData = change.before.data() as User;
    const newUserData = change.after.data() as User;
    const oldCoverPhotoCloudID = oldUserData.coverPhotoCloudID;
    const oldAvatarCloudID = oldUserData.avatarCloudID;
    const newCoverPhotoCloudID = newUserData.coverPhotoCloudID;
    const newAvatarCloudID = newUserData.avatarCloudID;

    const updatePromises = [];
    if (oldCoverPhotoCloudID && oldCoverPhotoCloudID !== newCoverPhotoCloudID) {
      const oldCoverPhotoPath = `users/${userID}/coverPhoto/${oldCoverPhotoCloudID}`;
      updatePromises.push(
        storage
          .bucket()
          .file(`${oldCoverPhotoPath}_fullSize`)
          .delete()
          .catch((err) =>
            console.error(
              'unable to delete old cover photo with id ' +
                oldCoverPhotoCloudID +
                ' for user with id ' +
                userID,
              err
            )
          )
      );
    }

    if (oldAvatarCloudID && oldAvatarCloudID !== newAvatarCloudID) {
      const oldAvatarPath = `users/${userID}/avatar/${oldAvatarCloudID}`;
      updatePromises.push(
        storage
          .bucket()
          .file(`${oldAvatarPath}_fullSize`)
          .delete()
          .catch((err) =>
            console.error(
              'unable to delete old avatar with id ' +
                oldAvatarCloudID +
                ' for user with id ' +
                userID,
              err
            )
          )
      );
    }

    return Promise.all(updatePromises);
  });

export const instantiateFollowingFeedForNewUser = functions.firestore
  .document('users/{userID}')
  .onCreate(async (change) => {
    const userID = change.id;
    await db.doc(`users/${userID}/feeds/followingFeed`).set({
      id: 'followingFeed',
    });
  });

export async function checkAuthAndGetUserFromContext(
  context: functions.https.CallableContext
) {
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
    avatar: userData.avatar ? userData.avatar : undefined,
  };

  return author;
}

export const setUserIsFollowedBySelfOnCreation = functions.firestore
  .document('users/{userID}')
  .onCreate(async (change) => {
    const userID = change.id;
    const user = change.data();
    const userRef: UserRef = {
      id: change.id,
      name: user.name,
    };
    if (user.avatar) userRef.avatar = user.avatar;
    await db.doc(`users/${userID}/followedByUsers/${userID}`).set(userRef);
  });

export const MAX_RECENT_TOPICS = 20;
export const addPostTopicsToRecentUserTopics = functions.firestore
  .document('users/{userID}/posts/{postID}')
  .onCreate(async (change, context) => {
    const post = change.data() as PostRef;
    const authorID = context.params.userID;
    const topics = post.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToUserDoc(
      authorID,
      topics,
      'recentPostTopics'
    );
  });

export const addPublicationTopicsToRecentUserTopics = functions.firestore
  .document('users/{userID}/publications/{publicationID}')
  .onCreate(async (change, context) => {
    const publication = change.data() as PublicationRef;
    const authorID = context.params.userID;
    const topics = publication.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToUserDoc(
      authorID,
      topics,
      'recentPublicationTopics'
    );
  });

export const checkPublicationFilterAuthorIDs = functions.firestore
  .document('users/{userID}/publications/{publicationID}')
  .onCreate(async (change, context) => {
    const publication = change.data() as PublicationRef;
    const authorID = context.params.userID;
    const publicationID = context.params.publicationID;
    if (
      publication.filterAuthorIDs &&
      publication.filterAuthorIDs.includes(authorID)
    )
      return;
    console.error(
      `publication ${publicationID} filterAuthorIDs was not updated with the userID`
    );
    // this will automatically update the author pub
    const publicationRef = db.doc(`publications/${publicationID}`);
    if (!publication.filterAuthorIDs)
      return publicationRef.update({filterAuthorIDs: [authorID]});
    return publicationRef.update({
      filterAuthorIDs: firestore.FieldValue.arrayUnion(authorID),
    });
  });

async function addRecentResourceTopicsToUserDoc(
  authorID: string,
  newTopics: TaggedTopic[],
  targetField: 'recentPublicationTopics' | 'recentPostTopics'
) {
  const authorRef = db.doc(`users/${authorID}`);
  const userDocData = await authorRef
    .get()
    .then((ds) => ds.data() as User)
    .catch((err) =>
      console.error(`unable to get user doc for userId ${authorID} ${err}`)
    );
  if (!userDocData) return;
  const currentRecentTopics = userDocData[targetField] as TaggedTopic[];
  let newRecentTopics;
  if (!currentRecentTopics) newRecentTopics = newTopics;
  else {
    newRecentTopics = currentRecentTopics;
    newTopics.forEach((topic) => newRecentTopics.unshift(topic));
  }
  if (newRecentTopics.length > MAX_RECENT_TOPICS)
    newRecentTopics.splice(MAX_RECENT_TOPICS);
  return authorRef.set(
    {
      [targetField]: newRecentTopics,
    },
    {merge: true}
  );
}

export const addUserToRelatedTopic = functions.firestore
  .document('users/{userID}/topics/{topicID}')
  .onCreate(async (change, context) => {
    const userID = context.params.userID;
    const topicID = context.params.topicID;
    return setUserOnTopic(topicID, userID);
  });

export const addOpenPositionTopicsToUser = functions.firestore
  .document(`users/{userID}/openPositions/{openPositionID}`)
  .onCreate(async (change, context) => {
    const openPosition = change.data() as OpenPosition;
    const openPositionTopics = openPosition.topics;
    const userID = context.params.userID;
    if (openPositionTopics && openPositionTopics.length > 0) {
      return await addTopicsToResource(openPositionTopics, userID, 'user');
    }
    return null;
  });

export const updateUserRankOnTopic = functions.firestore
  .document('users/{userID}/topics/{topicID}')
  .onUpdate(async (change, context) => {
    const topicID = context.params.topicID;
    const userID = context.params.userID;
    const topic = change.after.data() as Topic;
    const updatePromise = await db
      .doc(`topics/${topicID}/users/${userID}`)
      .update({rank: topic.rank})
      .then(() => true)
      .catch((err) => {
        console.error(
          'unable to update rank of user with id ' +
            userID +
            ' on topic with id ' +
            topicID,
          err
        );
        return false;
      });
    if (updatePromise) return;
    return setUserOnTopic(topicID, userID, topic.rank);
  });

export async function setUserOnTopic(
  topicID: string,
  userID: string,
  rank?: number
) {
  const userInTopicDocRef = db.doc(`topics/${topicID}/users/${userID}`);
  return db
    .doc(`users/${userID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return;
      const user = ds.data() as User;
      const userRef = toUserRef(user.id, user);
      userRef.rank = rank ? rank : 1;
      return userInTopicDocRef
        .set(userRef)
        .catch((err) =>
          console.log(
            err,
            'could not set user with id ' +
              userID +
              ' on topic with id' +
              topicID
          )
        );
    })
    .catch((err) =>
      console.log(
        err,
        'could not fetch user in order to add user ref to topic.'
      )
    );
}

export const addRecentPostsToFeedOnNewUserFollow = functions.firestore
  .document(`users/{followedUserID}/followedByUsers/{followerID}`)
  .onCreate(
    async (_, context): Promise<void[]> => {
      const followerID = context.params.followerID;
      const followedUserID = context.params.followedUserID;
      return await addRecentPostsToFollowingFeed(
        followerID,
        db.collection(`users/${followedUserID}/posts`)
      );
    }
  );

export const updateUserRefOnTopics = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const topicsQS = await db
      .collection(`users/${userID}/topics`)
      .get()
      .catch((err) =>
        console.error('unable to fetch topics for user with id ' + userID, err)
      );
    if (!topicsQS || topicsQS.empty) return;
    const topicsIDsAndRanks: any[] = [];
    topicsQS.forEach((ds) => {
      const topicID = ds.id;
      const topic = ds.data();
      topicsIDsAndRanks.push({id: topicID, rank: topic.rank});
    });
    const topicsUpdatePromise = topicsIDsAndRanks.map(
      async (topicIDAndRank) => {
        const topicRank = topicIDAndRank.rank;
        const topicID = topicIDAndRank.id;
        const userWithTopicSpecificRank = {...newUserData};
        userWithTopicSpecificRank.rank = topicRank;
        return db
          .doc(`topics/${topicID}/users/${userID}`)
          .set(toUserRef(userID, userWithTopicSpecificRank))
          .catch((err) =>
            console.error(
              'unable to update user ref on topic with id ' +
                topicID +
                ' for user with id ' +
                userID,
              err
            )
          );
      }
    );
    return Promise.all(topicsUpdatePromise);
  });

export const updateUserRefOnOpenPositions = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserSignature(userID, newUserData)) ===
      JSON.stringify(toUserSignature(userID, oldUserData))
    )
      return;
    const openPositionsQS = await db
      .collection(`users/${userID}/openPositions`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch open positions of user with id ' + userID,
          err
        )
      );
    if (!openPositionsQS || openPositionsQS.empty) return;
    const openPositionsIDs: string[] = [];
    openPositionsQS.forEach((ds) => {
      const openPositionID = ds.id;
      openPositionsIDs.push(openPositionID);
    });
    const openPositionsUpdatePromise = openPositionsIDs.map(
      async (openPositionID) =>
        db
          .doc(`openPositions/${openPositionID}`)
          .update({author: toUserSignature(userID, newUserData)})
          .catch((err) =>
            console.error(
              'unable to update user ref on open position with id ' +
                openPositionID +
                ' for user with id ' +
                userID,
              err
            )
          )
    );
    return Promise.all(openPositionsUpdatePromise);
  });

export const updateUserRefOnMemberGroups = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const groupsQS = await db
      .collection(`users/${userID}/groups`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch groups of which user with id ' +
            userID +
            ' is a member.',
          err
        )
      );
    if (!groupsQS || groupsQS.empty) return;
    const groupsIDs: string[] = [];
    groupsQS.forEach((ds) => {
      const groupID = ds.id;
      groupsIDs.push(groupID);
    });
    const groupsUpdatePromise = groupsIDs.map(async (groupID) => {
      return db
        .doc(`groups/${groupID}/members/${userID}`)
        .set(toUserRef(userID, newUserData), {merge: true})
        .catch((err) =>
          console.error(
            'unable to update user ref on group with id ' +
              groupID +
              ' for user with id ' +
              userID,
            err
          )
        );
    });
    return Promise.all(groupsUpdatePromise);
  });

export const updateUserRefOnFollowers = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const followersQS = await db
      .collection(`users/${userID}/followedByUsers`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch followers of user with id ' + userID,
          err
        )
      );
    if (!followersQS || followersQS.empty) return;
    const followersIDs: string[] = [];
    followersQS.forEach((ds) => {
      const followerID = ds.id;
      followersIDs.push(followerID);
    });
    const followersUpdatePromise = followersIDs.map(async (followerID) => {
      return db
        .doc(`users/${followerID}/followsUsers/${userID}`)
        .set(toUserRef(userID, newUserData))
        .catch((err) =>
          console.error(
            'unable to update user ref on follower with id ' +
              followerID +
              ' for followed user with id ' +
              userID,
            err
          )
        );
    });
    return Promise.all(followersUpdatePromise);
  });

export const updateUserRefOnUsersYouFollow = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const followsQS = await db
      .collection(`users/${userID}/followsUsers`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch people that user follows for user with id ' + userID,
          err
        )
      );
    if (!followsQS || followsQS.empty) return;
    const peopleFollowedIDs: string[] = [];
    followsQS.forEach((ds) => {
      const personFollowedID = ds.id;
      peopleFollowedIDs.push(personFollowedID);
    });
    const followsUpdatePromise = peopleFollowedIDs.map(
      async (personFollowedID) => {
        return db
          .doc(`users/${personFollowedID}/followedByUsers/${userID}`)
          .set(toUserRef(userID, newUserData))
          .catch((err) =>
            console.error(
              'unable to update user ref on user with id ' +
                personFollowedID +
                ' for follower with id ' +
                userID,
              err
            )
          );
      }
    );
    return Promise.all(followsUpdatePromise);
  });

export const updateUserRefOnGroupsYouFollow = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const followsQS = await db
      .collection(`users/${userID}/followsGroups`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch groups that user follows for user with id ' + userID,
          err
        )
      );
    if (!followsQS || followsQS.empty) return;
    const groupFollowedIDs: string[] = [];
    followsQS.forEach((ds) => {
      const groupFollowedID = ds.id;
      groupFollowedIDs.push(groupFollowedID);
    });
    const followsUpdatePromise = groupFollowedIDs.map(
      async (groupFollowedID) => {
        return db
          .doc(`groups/${groupFollowedID}/followedByUsers/${userID}`)
          .set(toUserRef(userID, newUserData))
          .catch((err) =>
            console.error(
              'unable to update user ref on group with id ' +
                groupFollowedID +
                ' for follower with id ' +
                userID,
              err
            )
          );
      }
    );
    return Promise.all(followsUpdatePromise);
  });

export const updateUserRefOnTopicsYouFollow = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const followsQS = await db
      .collection(`users/${userID}/followsTopics`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch topics that user follows for user with id ' + userID,
          err
        )
      );
    if (!followsQS || followsQS.empty) return;
    const topicsFollowedIDs: string[] = [];
    followsQS.forEach((ds) => {
      const topicFollowedID = ds.id;
      topicsFollowedIDs.push(topicFollowedID);
    });
    const followsUpdatePromise = topicsFollowedIDs.map(
      async (topicFollowedID) => {
        return db
          .doc(`topics/${topicFollowedID}/followedByUsers/${userID}`)
          .set(toUserRef(userID, newUserData))
          .catch((err) =>
            console.error(
              'unable to update user ref on topic with id ' +
                topicFollowedID +
                ' for follower with id ' +
                userID,
              err
            )
          );
      }
    );
    return Promise.all(followsUpdatePromise);
  });

export const updateUserRefOnPosts = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserSignature(userID, newUserData)) ===
      JSON.stringify(toUserSignature(userID, oldUserData))
    )
      return;
    const postsQS = await db
      .collection(`users/${userID}/posts`)
      .get()
      .catch((err) =>
        console.error('unable to fetch posts for user with id ' + userID, err)
      );
    if (!postsQS || postsQS.empty) return;
    const postsIDs: string[] = [];
    postsQS.forEach((ds) => {
      const postID = ds.id;
      postsIDs.push(postID);
    });
    const postsUpdatePromise = postsIDs.map(async (postID) => {
      return db
        .doc(`posts/${postID}`)
        .update({author: toUserSignature(userID, newUserData)})
        .catch((err) =>
          console.error(
            'unable to update user ref on post with id ' +
              postID +
              ' for user with id ' +
              userID,
            err
          )
        );
    });
    return Promise.all(postsUpdatePromise);
  });

export const updateUserRefOnPublications = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    // we don't want to update pubs when the user first gets the ms ID.
    // this is handled by addMSUserPubsToNewLinkedUser
    if (
      newUserData.name === oldUserData.name ||
      !newUserData.microsoftIDs ||
      !oldUserData.microsoftIDs
    )
      return;
    const oldPublicationUser = toUserPublicationRef(oldUserData.name, userID);
    const newPublicationUser = toUserPublicationRef(newUserData.name, userID);
    const publicationsQS = await db
      .collection(`users/${userID}/publications`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch publications for user with id ' + userID,
          err
        )
      );
    if (!publicationsQS || publicationsQS.empty) return;
    const publicationsIDs: string[] = [];
    publicationsQS.forEach((ds) => {
      const publicationID = ds.id;
      publicationsIDs.push(publicationID);
    });
    const publicationsUpdatePromise = publicationsIDs.map(
      async (publicationID) => {
        const publicationRef = db.doc(`publications/${publicationID}`);
        const batch = db.batch();
        batch.update(publicationRef, {
          authors: firestore.FieldValue.arrayRemove(oldPublicationUser),
        });
        batch.update(publicationRef, {
          authors: firestore.FieldValue.arrayUnion(newPublicationUser),
        });
        return batch
          .commit()
          .catch((err) =>
            console.error(
              'unable to update user ref on publication with id ' +
                publicationID +
                ' for user with id ' +
                userID,
              err
            )
          );
      }
    );
    await Promise.all(publicationsUpdatePromise);
  });

export const updateUserRefForRecommendations = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserRef(userID, newUserData)) ===
      JSON.stringify(toUserRef(userID, oldUserData))
    )
      return;
    const recommendationsQS = await db
      .collection(`users/${userID}/recommendations`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch recommendations for user with id ' + userID,
          err
        )
      );
    if (!recommendationsQS || recommendationsQS.empty) return;
    const recommendationsIDsAndTypes: any[] = [];
    recommendationsQS.forEach((ds) => {
      const recommendationID = ds.id;
      const recommendedResourceType = ds.data().recommendedResourceType;
      recommendationsIDsAndTypes.push({
        id: recommendationID,
        type: recommendedResourceType,
      });
    });
    const recommendationsUpdatePromise = recommendationsIDsAndTypes.map(
      async (recommendedIDAndType) => {
        let documentRef;
        switch (recommendedIDAndType.type) {
          case 'post':
            documentRef = db.doc(
              `posts/${recommendedIDAndType.id}/recommendedBy/${userID}`
            );
            break;
          case 'publication':
            documentRef = db.doc(
              `publications/${recommendedIDAndType.id}/recommendedBy/${userID}`
            );
            break;

          default:
            documentRef = undefined;
        }
        if (!documentRef) return null;
        return documentRef
          .set(toUserRef(userID, newUserData))
          .catch((err) =>
            console.error(
              'unable to update user ref on ' +
                recommendedIDAndType.type +
                ' recommendation with id ' +
                recommendedIDAndType.id +
                ' for user with id ' +
                userID,
              err
            )
          );
      }
    );
    return Promise.all(recommendationsUpdatePromise);
  });

export const updateGroupMemberPostFilter = functions.firestore
  .document(`users/{userID}`)
  .onUpdate(async (change, context) => {
    const newUserName = change.after.data().name as string;
    const oldUserName = change.before.data().name as string;
    const userID = context.params.userID;
    if (newUserName === oldUserName) return;
    const groupsQS = await db
      .collection(`users/${userID}/groups`)
      .get()
      .catch((err) =>
        console.error('unable to fetch groups for user with id ' + userID, err)
      );
    if (!groupsQS || groupsQS.empty) return;
    const groups: GroupRef[] = [];
    groupsQS.forEach((groupDS) => {
      if (!groupDS.exists) return;
      const groupData = groupDS.data() as GroupRef;
      groupData.id = groupDS.id;
      groups.push(groupData);
    });
    const groupsIDsToUpdate: string[] = [];
    const groupPromises = groups.map(async (group) => {
      const groupID = group.id;
      return db
        .collection(
          `groups/${groupID}/feeds/postsFeed/filterCollections/user/filterOptions`
        )
        .get()
        .then((filterOptionQS) => {
          if (filterOptionQS.empty) return;
          let hasMatchingOption: boolean = false;
          filterOptionQS.forEach((filterOption) => {
            if (filterOption.id === userID) hasMatchingOption = true;
          });
          if (hasMatchingOption) {
            groupsIDsToUpdate.push(groupID);
          }
          return;
        })
        .catch((err) =>
          console.error(
            'unable to fetch group postsFeed filter options with id for group with id' +
              groupID +
              ' while updating user filter ref',
            err
          )
        );
    });

    await Promise.all(groupPromises);

    const filterUpdatesPromises = groupsIDsToUpdate.map(
      async (groupIDToUpdate) => {
        const groupUserFilterRef = db.doc(
          `groups/${groupIDToUpdate}/feeds/postsFeed/filterCollections/user/filterOptions/${userID}`
        );
        return updateRefOnFilterCollection(groupUserFilterRef, {
          name: newUserName,
          id: userID,
        });
      }
    );
    return Promise.all(filterUpdatesPromises);
  });

export const updateGroupMemberPublicationsFilter = functions.firestore
  .document(`users/{userID}`)
  .onUpdate(async (change, context) => {
    const newUserName = change.after.data().name as string;
    const oldUserName = change.before.data().name as string;
    const userID = context.params.userID;
    if (newUserName === oldUserName) return;
    const groupsQS = await db
      .collection(`users/${userID}/groups`)
      .get()
      .catch((err) =>
        console.error('unable to fetch groups for user with id ' + userID, err)
      );
    if (!groupsQS || groupsQS.empty) return;
    const groups: GroupRef[] = [];
    groupsQS.forEach((groupDS) => {
      if (!groupDS.exists) return;
      const groupData = groupDS.data() as GroupRef;
      groupData.id = groupDS.id;
      groups.push(groupData);
    });
    const groupsIDsToUpdate: string[] = [];
    const groupPromises = groups.map(async (group) => {
      const groupID = group.id;
      return db
        .collection(
          `groups/${groupID}/feeds/publicationsFeed/filterCollections/user/filterOptions`
        )
        .get()
        .then((filterOptionQS) => {
          if (filterOptionQS.empty) return;
          let hasMatchingOption: boolean = false;
          filterOptionQS.forEach((filterOption) => {
            if (filterOption.id === userID) hasMatchingOption = true;
          });
          if (hasMatchingOption) {
            groupsIDsToUpdate.push(groupID);
          }
          return;
        })
        .catch((err) =>
          console.error(
            'unable to fetch group postsFeed filter options with id for group with id' +
              groupID +
              ' while updating user filter ref',
            err
          )
        );
    });

    await Promise.all(groupPromises);

    const filterUpdatesPromises = groupsIDsToUpdate.map(
      async (groupIDToUpdate) => {
        const groupUserFilterRef = db.doc(
          `groups/${groupIDToUpdate}/feeds/publicationsFeed/filterCollections/user/filterOptions/${userID}`
        );
        return updateRefOnFilterCollection(groupUserFilterRef, {
          name: newUserName,
          id: userID,
        });
      }
    );
    return Promise.all(filterUpdatesPromises);
  });

export const removeGroupFromUser = functions.firestore
  .document('groups/{groupID}/members/{userID}')
  .onDelete(async (_, context) => {
    const userID = context.params.userID;
    const groupID = context.params.groupID;
    await db
      .doc(`users/${userID}/groups/${groupID}`)
      .delete()
      .catch((err) => console.log(err, 'could not remove group from user'));
  });

// for a set of selected publications, set the user's microsoft academic ID
export const setMicrosoftAcademicIDByPublicationMatches = functions.https.onCall(
  async (data, context) => {
    if (context.auth === undefined) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to associate a user account with a microsoft academic author ID.'
      );
    }
    const userID = context.auth.uid;

    if (
      !data.microsoftAcademicAuthorIDs ||
      data.microsoftAcademicAuthorIDs.length === 0
    )
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide microsoft author IDs'
      );

    const batch = db.batch();
    const userToBeLinkedDBRef = db.doc(`users/${userID}`);
    const microsoftIDsToBeLinked: string[] = [];
    const handleAuthorIDsPromises = data.microsoftAcademicAuthorIDs.map(
      async (microsoftAcademicAuthorIDUnformatted: number) => {
        const microsoftAcademicAuthorID = microsoftAcademicAuthorIDUnformatted.toString();
        const user = await userToBeLinkedDBRef
          .get()
          .then((ds) => {
            if (!ds.exists) return;
            return ds.data() as User;
          })
          .catch((err) =>
            console.log(err, 'could not fetch user to be linked')
          );
        if (!user)
          throw new functions.https.HttpsError(
            'not-found',
            `No user found with ID ${userID}`
          );
        if (
          user.microsoftIDs &&
          user.microsoftIDs.length + data.microsoftAcademicAuthorIDs.length >= 3
        )
          throw new functions.https.HttpsError(
            'already-exists',
            `User with id ${userID} is already linked to at least 3 microsoft ids`
          );
        const fetchMSUser = () =>
          db
            .doc(`MSUsers/${microsoftAcademicAuthorID}`)
            .get()
            .then((ds) => {
              if (!ds.exists) return;
              return ds.data() as MAKAuthor;
            })
            .catch((err) =>
              console.log(
                err,
                'unable to verify if MSUser with id ' +
                  microsoftAcademicAuthorID +
                  'is already linked',
                err
              )
            );
        let MSUser = await fetchMSUser();
        if (!MSUser) {
          await new Promise((resolve) => {
            setTimeout(() => resolve(true), 3000);
          });
          MSUser = await fetchMSUser();
          if (!MSUser) {
            throw new functions.https.HttpsError(
              'not-found',
              `No MSUser found with ID ${microsoftAcademicAuthorID}`
            );
          }
        }
        if (MSUser.processed)
          throw new functions.https.HttpsError(
            'already-exists',
            `MSUser with id ${microsoftAcademicAuthorID} is already linked to a labspoon user`
          );

        microsoftIDsToBeLinked.push(microsoftAcademicAuthorID);
        batch.update(db.doc(`MSUsers/${microsoftAcademicAuthorID}`), {
          processed: userID,
        });
      }
    );
    await Promise.all(handleAuthorIDsPromises);
    if (microsoftIDsToBeLinked.length === 0) return;
    batch.update(userToBeLinkedDBRef, {
      microsoftIDs: microsoftIDsToBeLinked,
    });
    return batch.commit().catch((err) => {
      console.error(err);
      throw new functions.https.HttpsError(
        'internal',
        'batch commit failed',
        err
      );
    });
  }
);

export const addPublicationTopicsToUser = functions.firestore
  .document(`users/{userID}/publications/{publicationID}`)
  .onCreate(async (change, context) => {
    const userID = context.params.userID;
    const publication = change.data();
    const publicationTopics = publication.topics;
    if (!publicationTopics || publicationTopics.length === 0) return null;
    return await addTopicsToResource(publicationTopics, userID, 'user');
  });

export const removePublicationTopicsToUser = functions.firestore
  .document(`users/{userID}/publications/{publicationID}`)
  .onDelete(async (change, context) => {
    const userID = context.params.userID;
    const publication = change.data();
    const publicationTopics = publication.topics;
    if (!publicationTopics || publicationTopics.length === 0) return null;
    return await removeTopicsFromResource(publicationTopics, userID, 'user');
  });

export const addUserPostToFollowersFeeds = functions.firestore
  .document('users/{userID}/posts/{postID}')
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const postID = context.params.postID;
    const userID = context.params.userID;
    const followers = await db
      .collection(`users/${userID}/followedByUsers`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch followers of user with id ' + userID,
          err
        )
      );
    if (!followers || followers.empty) return;
    const postAddedPromises: Promise<void>[] = [];
    followers.forEach(async (followerSnapshot) => {
      const followerID = followerSnapshot.id;
      const followerData = followerSnapshot.data();
      const omittedPostTypes: Array<FollowPostTypePreferences> =
        followerData.omittedPostTypes;
      const omittedTopics: Array<Topic | FollowNoTopicsPreference> =
        followerData.omittedTopics;
      let postIsBlockedByFollowPreferences = false;
      if (omittedPostTypes && omittedPostTypes.length > 0) {
        if (doFollowPreferencesBlockPost('postTypes', post, omittedPostTypes))
          postIsBlockedByFollowPreferences = true;
      }
      if (omittedTopics && omittedTopics.length > 0) {
        if (doFollowPreferencesBlockPost('topics', post, omittedTopics))
          postIsBlockedByFollowPreferences = true;
      }
      if (postIsBlockedByFollowPreferences) return;
      const followingFeedPostRef = db.doc(
        `users/${followerID}/feeds/followingFeed/posts/${postID}`
      );
      const batch = db.batch();
      batch.set(followingFeedPostRef, post);
      batch.set(
        db.doc(`posts/${postID}/onFollowingFeedsOfUsers/${followerID}`),
        {id: followerID}
      );
      postAddedPromises.push(
        batch
          .commit()
          .catch((err) =>
            console.error(
              'unable to add posts from user with id ' +
                userID +
                ' to follower with id ' +
                followerID,
              err
            )
          )
          .then(() => {
            return;
          })
      );
    });
    return Promise.all(postAddedPromises);
  });

export const updateUserRefOnFollowFeedFilters = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (newUserData.name === oldUserData.name) return;
    const followedByQS = await db
      .collection(`users/${userID}/followedBy`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch followed by for user with id ' + userID,
          err
        )
      );
    if (!followedByQS || followedByQS.empty) return;
    const followedByIDs: string[] = [];
    followedByQS.forEach((ds) => {
      const followerID = ds.id;
      followedByIDs.push(followerID);
    });
    const followersUpdatePromise = followedByIDs.map(async (followerID) => {
      return db
        .doc(
          `users/${followerID}/feeds/followingFeed/filterCollections/user/filterOptions/${followerID}`
        )
        .update({name: newUserData.name})
        .catch((err) =>
          console.error(
            'unable to update user name on filter of follower with id ' +
              followerID +
              ' for user with id ' +
              userID,
            err
          )
        );
    });
    return Promise.all(followersUpdatePromise);
  });

export const addExtraMSIDToUser = functions.https.onRequest(
  async (req, resp) => {
    const userID = req.body.userID;
    const microsoftID = req.body.microsoftID;
    if (!userID || !microsoftID)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide microsoft ID and userID'
      );
    const batch = db.batch();
    batch.update(db.doc(`users/${userID}`), {
      microsoftIDs: firestore.FieldValue.arrayUnion(microsoftID),
    });
    batch.update(db.doc(`MSUsers/${microsoftID}`), {
      processed: userID,
    });
    return batch
      .commit()
      .then(() => {
        resp.json({
          result: `added microsoft ID to user and userID to MAKAuthor`,
        });
        resp.end();
      })
      .catch((err) => {
        console.error(err);
        resp.status(500).send('Unable to commit changes.');
        return;
      });
  }
);

export const DeclareUserIsMemberOfAnyGroup = functions.firestore
  .document('users/{userID}/groups/{groupID}')
  .onCreate(async (data, context) => {
    const userID = context.params.userID;
    const userRef = db.doc(`users/${userID}`);
    const userDoc = await userRef
      .get()
      .catch((err) => console.error(`unable to fetch user doc ${err}`));
    if (!userDoc || !userDoc.exists) return;
    const userDocData = userDoc.data() as User;
    if (userDocData.isMemberOfAnyGroups) return;
    return userRef
      .update({isMemberOfAnyGroups: true})
      .catch((err) => console.error(err));
  });

export const DeclareUserIsNotMemberOfAnyGroup = functions.firestore
  .document('users/{userID}/groups/{groupID}')
  .onDelete(async (data, context) => {
    const userID = context.params.userID;
    const userGroupsQS = await db
      .collection(`users/${userID}/groups`)
      .get()
      .catch((err) =>
        console.error(`unable to check if user is member of any groups ${err}`)
      );
    if (!userGroupsQS || !userGroupsQS.empty) return;
    return db
      .doc(`users/${userID}`)
      .update({isMemberOfAnyGroups: false})
      .catch((err) => console.error(err));
  });

export const updateUserRefOnComments = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const oldUserData = change.before.data() as User;
    const userID = context.params.userID;
    if (
      JSON.stringify(toUserSignature(userID, newUserData)) ===
      JSON.stringify(toUserSignature(userID, oldUserData))
    )
      return;
    const userCommentsQS = await db
      .collection(`users/${userID}/comments`)
      .get()
      .catch((err) =>
        console.error(
          `unable to fetch user comments in order to update user signature ${err}`
        )
      );
    if (!userCommentsQS || userCommentsQS.empty) return;
    const commentPostIDs: {commentID: string; postID: string}[] = [];
    userCommentsQS.forEach((ds) => {
      const commentData = ds.data();
      const postID = commentData.postID;
      const commentID = ds.id;
      commentPostIDs.push({
        postID: postID,
        commentID: commentID,
      });
    });
    const batch = db.batch();
    commentPostIDs.forEach((ids) =>
      batch.update(db.doc(`posts/${ids.postID}/comments/${ids.commentID}`), {
        author: toUserSignature(userID, newUserData),
      })
    );
    await batch
      .commit()
      .catch((err) =>
        console.error(
          `unable to batch update user signature for user ${userID} on comments ${err}`
        )
      );
  });

// Rank relates to how often the user posts in this topic
export interface UserRef {
  id: string;
  name: string;
  avatar?: string;
  rank?: number;
  microsoftID?: string;
  reputation?: number;
  position?: string;
  institution?: string;
}

export interface UserAlgoliaRef {
  id: string;
  name: string;
  avatar?: string;
  microsoftID?: string;
  microsoftIDs?: string[];
  reputation?: number;
  position?: string;
  institution?: string;
  recentPublicationTopics?: Topic[];
  recentPostTopics?: Topic[];
}

export function toUserRef(userID: string, user: User) {
  const userRef: UserRef = {
    id: userID,
    name: user.name,
  };
  if (user.avatar) userRef.avatar = user.avatar;
  if (user.position) userRef.position = user.position;
  if (user.institution) userRef.institution = user.institution;
  if (user.rank) userRef.rank = user.rank;
  if (user.reputation) userRef.reputation = user.reputation;
  return userRef;
}

export function toUserSignature(userID: string, user: any) {
  const userRef: UserRef = {
    id: userID,
    name: user.name,
    avatar: user.avatar ? user.avatar : null,
  };
  return userRef;
}

export function toUserAlgoliaFilterRef(user: User, userID: string) {
  const userAlgoliaRef: UserAlgoliaRef = {
    id: userID,
    name: user.name,
  };
  if (user.microsoftIDs) userAlgoliaRef.microsoftIDs = user.microsoftIDs;
  if (user.position) userAlgoliaRef.position = user.position;
  if (user.institution) userAlgoliaRef.institution = user.institution;
  if (user.reputation) userAlgoliaRef.reputation = user.reputation;
  if (user.avatar) userAlgoliaRef.avatar = user.avatar;
  if (user.recentPublicationTopics)
    userAlgoliaRef.recentPublicationTopics = user.recentPublicationTopics;
  if (user.recentPostTopics)
    userAlgoliaRef.recentPostTopics = user.recentPostTopics;
  return userAlgoliaRef;
}

export function toUserPublicationRef(userName: string, userID: string) {
  const publicationUserRef: UserPublicationRef = {
    name: userName,
    id: userID,
  };
  return publicationUserRef;
}

export function toUserFilterRef(
  userName: string,
  userID: string,
  rank?: number
) {
  const userFilterRef: UserFilterRef = {
    id: userID,
    name: userName,
  };
  if (rank) userFilterRef.rank = rank;
  return userFilterRef;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  avatarCloudID?: string;
  coverPhoto?: string;
  coverPhotoCloudID?: string;
  checkedCreateOnboardingTip?: boolean;
  microsoftID?: string;
  microsoftIDs?: string[];
  rank?: number;
  reputation?: number;
  position?: string;
  institution?: string;
  lastPostTimeStamp?: number;
  recentPublicationTopics?: Topic[];
  recentPostTopics?: Topic[];
  isMemberOfAnyGroups?: boolean;
}

export interface UserFilterRef {
  id: string;
  name: string;
  rank?: number;
}

export interface UserStatsRef {
  dailyPostCount: number;
}

export interface UserPublicationRef {
  id?: string;
  name: string;
  microsoftID?: string;
  normalisedName?: string;
}

export interface UserCustomPublicationRef {
  id: string;
  name: string;
  microsoftID?: string;
  microsoftIDs?: string[];
}

export interface ExpressionAndName {
  name: string;
  expression: string;
}
