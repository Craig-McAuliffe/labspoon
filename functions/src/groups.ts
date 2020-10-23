import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {updateFilterCollection, Post, Topic} from './posts';

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
    const groupID = context.params.groupID;
    setGroupOnTopic(topic, groupID).catch((err) =>
      console.log(err, 'could not add group to topic')
    );
  });

export const updateGroupOnRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onUpdate(async (change, context) => {
    const topic = change.after.data() as Topic;
    const groupID = context.params.groupID;
    setGroupOnTopic(topic, groupID).catch((err) =>
      console.log(err, 'could not update group rank on topic')
    );
  });

export const removeGroupOnRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onDelete(async (change, context) => {
    const topic = change.data() as Topic;
    const groupID = context.params.groupID;
    await db
      .doc(`topics/${topic.id}/groups/${groupID}`)
      .delete()
      .catch((err) => console.log(err, 'unable to remove group from topic'));
  });

export async function setGroupOnTopic(topic: Topic, groupID: string) {
  const groupInTopicDocRef = db.doc(`topics/${topic.id}/groups/${groupID}`);
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
