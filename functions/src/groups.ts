import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {updateFilterCollection, Post} from './posts';
import {Topic} from './topics';

const db: firestore.Firestore = admin.firestore();

export const createGroupDocuments = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    db.collection(`groups/${groupID}/feeds`)
      .doc(`postsFeed`)
      .set({id: 'postsFeed'})
      .catch((err) =>
        console.log(err, 'could not create postsFeed for new group')
      );
  });

export const addGroupMembersToPostFilter = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const post = change.data() as Post;
    const groupPostsFeedRef = db.doc(`groups/${groupID}/feeds/postsFeed`);
    updateFilterCollection(
      groupPostsFeedRef,
      {resourceName: 'Author', resourceType: ResourceTypes.USER},
      {
        name: post.author.name,
        resourceID: post.author.id,
        avatar: post.author.avatar,
      },
      false
    ).catch((err) =>
      console.log(
        err,
        'could not update author option on group posts feed filter'
      )
    );
  });

export const removeGroupMembersFromPostFilter = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onDelete(async (change, context) => {
    const groupID = context.params.groupID;
    const post = change.data() as Post;
    const groupPostsFeedRef = db.doc(`groups/${groupID}/feeds/postsFeed`);
    updateFilterCollection(
      groupPostsFeedRef,
      {resourceName: 'Author', resourceType: ResourceTypes.USER},
      {
        name: post.author.name,
        resourceID: post.author.id,
        avatar: post.author.avatar,
      },
      true
    ).catch((err) =>
      console.log(
        err,
        'could not remove author option on group posts feed filter'
      )
    );
  });

export const addGroupToRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onCreate(async (change, context) => {
    const topic = change.data() as Topic;
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    setGroupOnTopic(topic, groupID, topicID).catch((err) =>
      console.log(err, 'could not add group to topic')
    );
  });

export const updateGroupOnRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onUpdate(async (change, context) => {
    const topic = change.after.data() as Topic;
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    setGroupOnTopic(topic, groupID, topicID).catch((err) =>
      console.log(err, 'could not update group rank on topic')
    );
  });

export const removeGroupOnRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onDelete(async (change, context) => {
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    await db
      .doc(`topics/${topicID}/groups/${groupID}`)
      .delete()
      .catch((err) => console.log(err, 'unable to remove group from topic'));
  });

// When a new member (Mark) is added to a group by an existing member (Jenna),
// Mark is added to the group's members collection by Jenna. Jenna does not
// have permission to modify Mark's groups collection, so this function
// performs this reciprocal update.
export const addGroupToUserGroups = functions.firestore.document('groups/{groupID}/members/{userID}').onCreate(async (_, context) => {
  const groupID = context.params.groupID;
  const userID = context.params.userID;
  const groupDS = await db.doc(`groups/${groupID}`).get().catch((err) => {
    console.log(`Unable to retrieve group with ID ${groupID}:`, err);
    throw new functions.https.HttpsError('not-found', `Unable to retrieve group with ID ${groupID}.`);
  });
  const group = groupDS.data() as GroupRef;
  await db.doc(`users/${userID}/groups/${groupID}`).set(group).catch((err) => {
    console.log(`Unable to set group with ID ${groupID} on user ${userID} groups collection:`, err);
    throw new functions.https.HttpsError('internal', `Unable to set group with ID ${groupID} on user ${userID} groups collection.`);
  });
  return true;
});

// Converse of addGroupToUserGroups.
export const removeGroupFromUserGroups = functions.firestore.document('groups/{groupID}/members/{userID}').onCreate(async (_, context) => {
  const groupID = context.params.groupID;
  const userID = context.params.userID;
  await db.doc(`users/${userID}/groups/${groupID}`).delete().catch((err) => {
    console.log(`Unable to remove group with ID ${groupID} from user ${userID} groups collection:`, err);
    throw new functions.https.HttpsError('internal', `Unable to remove group with ID ${groupID} from user ${userID} groups collection.`);
  });
});

export async function setGroupOnTopic(
  topic: Topic,
  groupID: string,
  topicID: string
) {
  const groupInTopicDocRef = db.doc(`topics/${topicID}/groups/${groupID}`);
  await db
    .doc(`groups/${groupID}`)
    .get()
    .then((qs) => {
      if (!qs.exists) return;
      const group = qs.data() as GroupRef;
      const groupRef = {
        id: group.id,
        name: group.name,
        avatar: group.avatar,
        about: group.about,
        rank: topic.rank,
      };
      groupInTopicDocRef
        .set(groupRef)
        .catch((err) =>
          console.log(err, 'could not add the group to the topic')
        );
    })
    .catch((err) => console.log(err, 'could not search for group'));
}

// Rank relates to how often the group posts about this topic
export interface GroupRef {
  id: string;
  name: string;
  avatar?: string;
  about?: string;
  rank?: number;
}
