import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {updateFilterCollection, Post} from './posts';
import {Topic} from './topics';
import {Publication} from './microsoft';

const db: firestore.Firestore = admin.firestore();

export const createGroupDocuments = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    await db.collection(`groups/${groupID}/feeds`)
      .doc(`postsFeed`)
      .set({id: 'postsFeed'})
      .catch((err) =>
        console.log(err, 'could not create postsFeed for new group')
      );
    await db.collection(`groups/${groupID}/feeds`)
      .doc(`publicationsFeed`)
      .set({id: 'publicationsFeed'})
      .catch((err) =>
        console.log(err, 'could not create publicationsFeed for new group')
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

export const addGroupMembersToPublicationFilter = functions.firestore
  .document(`groups/{groupID}/publications/{publicationID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const publication = change.data() as Publication;
    const groupPublicationsFeedRef = db.doc(`groups/${groupID}/feeds/publicationsFeed`);
    const updateFilterPromises = publication.authors!.map((author) => {
      if (!author.id) return;
      updateFilterCollection(
        groupPublicationsFeedRef,
        {resourceName: 'Author', resourceType: ResourceTypes.USER},
        {
          name: author.name,
          resourceID: author.id,
          avatar: author.avatar,
        },
        false
      ).catch((err) =>
        console.log(
          err,
          'could not update author option on group publications feed filter'
        )
      );
    });
    await Promise.all(updateFilterPromises);
  });

export const removeGroupMembersFromPublicationFilter = functions.firestore
  .document(`groups/{groupID}/publications/{publicationID}`)
  .onDelete(async (change, context) => {
    const groupID = context.params.groupID;
    const publication = change.data() as Publication;
    const groupPublicationsFeedRef = db.doc(`groups/${groupID}/feeds/publicationsFeed`);
    const updateFilterPromises = publication.authors!.map((author) => {
      if (!author.id) return;
      updateFilterCollection(
        groupPublicationsFeedRef,
        {resourceName: 'Author', resourceType: ResourceTypes.USER},
        {
          name: author.name,
          resourceID: author.id,
          avatar: author.avatar,
        },
        true
      ).catch((err) =>
        console.log(
          err,
          'could not update author option on group publications feed filter'
        )
      );
    });
    await Promise.all(updateFilterPromises);
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
export const removeGroupFromUserGroups = functions.firestore.document('groups/{groupID}/members/{userID}').onDelete(async (_, context) => {
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

// Adds group types to existing groups. Can be removed when issue #608 is
// promoted into all environments and this function has been run.
export const addGroupTypeToExistingGroups = functions.https.onCall(async () => {
  const groupCollectionRef = await db.collection('groups').get();
  const updatePromises: Promise<void | firestore.WriteResult>[] = [];
  groupCollectionRef.forEach((doc) => {
    const groupRef = doc.ref;
    const updatePromise = groupRef.update({groupType: 'researchGroup'}).catch((err) => console.error(err));
    updatePromises.push(updatePromise);
  });
  await Promise.all(updatePromises);
});

export function toGroupRef(groupID: string, group: any) {
  const groupRef: GroupRef = {
    id: groupID,
    name: group.name,
  }
  if (group.avatar) groupRef.avatar = group.avatar;
  if (group.about) groupRef.about = group.about;
  if (group.institution) groupRef.institution = group.institution;
  return groupRef;
}

export const verifyGroup = functions.https.onRequest(async (req, res) => {
  const groupID = req.body.data.groupID;
  if (!groupID) {
    throw new functions.https.HttpsError('invalid-argument', `A group ID must be provided.`);
  }
  const verification: VerifiedGroup = {
    timestamp: new Date(),
  };
  await db.doc(`verifiedGroups/${groupID}`).set(verification).catch((err) => {
    console.error(`Unable to verify group ${groupID}:`, err);
    throw new functions.https.HttpsError('internal', `Unable to verify group with ID ${groupID}.`);
  });
  res.status(200).send();
});

interface VerifiedGroup {
  timestamp: Date;
}

// Rank relates to how often the group posts about this topic
export interface GroupRef {
  id: string;
  name: string;
  avatar?: string;
  about?: string;
  institution?: string;
  rank?: number;
}
