import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {updateFilterCollection, Post} from './posts';
import {addTopicIDToTaggedTopic, TaggedTopic, Topic} from './topics';
import {Publication} from './microsoft';
import {OpenPosition} from './openPositions';
import {ResearchFocus} from './researchFocuses';
import {Technique} from './techniques';
import {UserRef} from './users';

const db: firestore.Firestore = admin.firestore();

const storage = admin.storage();

export const removeOldGroupAvatar = functions.firestore
  .document(`groups/{groupID}`)
  .onUpdate(async (change, context) => {
    const oldGroupData = change.before.data() as Group;
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const oldAvatarCloudID = oldGroupData.avatarCloudID;
    const newAvatarCloudID = newGroupData.avatarCloudID;
    if (oldAvatarCloudID && oldAvatarCloudID !== newAvatarCloudID) {
      const oldAvatarPath = `groups/${groupID}/avatar/${oldAvatarCloudID}`;
      return storage
        .bucket()
        .file(oldAvatarPath)
        .delete()
        .catch((err) =>
          console.error(
            'unable to delete old avatar with id ' +
              oldAvatarCloudID +
              ' for group with id ' +
              groupID,
            err
          )
        );
    }
    return null;
  });

export const createGroupDocuments = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    await db
      .collection(`groups/${groupID}/feeds`)
      .doc(`postsFeed`)
      .set({id: 'postsFeed'})
      .catch((err) =>
        console.log(err, 'could not create postsFeed for new group')
      );
    await db
      .collection(`groups/${groupID}/feeds`)
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
    const groupPublicationsFeedRef = db.doc(
      `groups/${groupID}/feeds/publicationsFeed`
    );
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
    const groupPublicationsFeedRef = db.doc(
      `groups/${groupID}/feeds/publicationsFeed`
    );
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
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    setGroupOnTopic(groupID, topicID);
  });

export const updateGroupOnRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onUpdate(async (change, context) => {
    const topic = change.after.data() as Topic;
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    db.doc(`topics/${topicID}/groups/${groupID}`)
      .update({rank: topic.rank})
      .catch((err) => {
        db.doc(`topics/${topicID}/groups/${groupID}`)
          .get()
          .then((ds) => {
            if (!ds.exists) setGroupOnTopic(groupID, topicID, topic.rank);
          })
          .catch(() =>
            console.error(
              'unable to check whether group with id ' +
                groupID +
                ' exists on topic with id ' +
                topicID
            )
          );
        console.error(
          'unable to update rank on group with id ' +
            groupID +
            ' in topic with id' +
            topicID,
          err
        );
      });
  });

export const removeGroupOnRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onDelete(async (change, context) => {
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    await db
      .doc(`topics/${topicID}/groups/${groupID}`)
      .delete()
      .catch((err) =>
        console.log(
          err,
          'unable to remove group with id ' +
            groupID +
            ' from topic with id ' +
            topicID
        )
      );
  });

export async function setGroupOnTopic(
  groupID: string,
  topicID: string,
  rank?: number
) {
  const groupInTopicDocRef = db.doc(`topics/${topicID}/groups/${groupID}`);
  await db
    .doc(`groups/${groupID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return;
      const group = ds.data() as Group;
      const groupRef = groupToGroupRef(group, groupID);
      groupRef.rank = rank ? rank : 1;
      groupInTopicDocRef
        .set(groupRef)
        .catch((err) =>
          console.error(
            err,
            'could not add group with id ' +
              groupID +
              ' to the topic with id' +
              topicID
          )
        );
    })
    .catch((err) =>
      console.error(
        err,
        'could not find group with id ' +
          groupID +
          ' on topic with id' +
          topicID
      )
    );
}

export const updateGroupRefOnFollowers = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const followers: UserRef[] = [];
    await db
      .collection(`groups/${groupID}/followedByUsers`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const follower = ds.data() as UserRef;
          if (!follower.id) follower.id = ds.id;
          followers.push(follower);
        });
      })
      .catch((err) =>
        console.error(
          'unable to fetch followers of group with id ' + groupID,
          err
        )
      );
    const followersUpdatePromise = followers.map(async (follower) => {
      return db
        .doc(`users/${follower.id}/followsGroups/${groupID}`)
        .set(groupToGroupRef(newGroupData, groupID))
        .catch((err) =>
          console.error(
            'unable to update group ref on follower with id ' +
              follower.id +
              ' of group with id ' +
              groupID,
            err
          )
        );
    });
    return Promise.all(followersUpdatePromise);
  });

export const updateGroupRefOnMembers = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const members: UserRef[] = [];
    await db
      .collection(`groups/${groupID}/members`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const member = ds.data() as UserRef;
          if (!member.id) member.id = ds.id;
          members.push(member);
        });
      })
      .catch((err) =>
        console.error(
          'unable to fetch members of group with id ' + groupID,
          err
        )
      );
    const membersUpdatePromise = members.map(async (member) => {
      return db
        .doc(`users/${member.id}/groups/${groupID}`)
        .set(groupToGroupRef(newGroupData, groupID))
        .catch((err) =>
          console.error(
            'unable to update group ref on member with id ' +
              member.id +
              ' of group with id ' +
              groupID,
            err
          )
        );
    });
    return Promise.all(membersUpdatePromise);
  });

export const updateGroupRefOnTopics = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const topics: Topic[] = [];
    await db
      .collection(`groups/${groupID}/topics`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const topic = ds.data() as Topic;
          const topicID = ds.id;
          topic.id = topicID;
          topics.push(topic);
        });
      })
      .catch((err) =>
        console.error('unable to fetch topics of group with id ' + groupID, err)
      );
    const topicsUpdatePromise = topics.map(async (topic) => {
      return db
        .doc(`topics/${topic.id}/groups/${groupID}`)
        .set(groupToGroupRef(newGroupData, groupID))
        .catch((err) =>
          console.error(
            'unable to update group ref on topic with id ' +
              topic.id +
              ' of group with id ' +
              groupID,
            err
          )
        );
    });
    return Promise.all(topicsUpdatePromise);
  });

export const updateGroupRefOnOpenPositions = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const openPositions: OpenPosition[] = [];
    await db
      .collection(`groups/${groupID}/openPositions`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const openPosition = ds.data() as OpenPosition;
          openPosition.id = ds.id;
          openPositions.push(openPosition);
        });
      })
      .catch((err) =>
        console.error(
          'unable to fetch open positions of group with id ' + groupID,
          err
        )
      );
    const openPositionsUpdatePromise = openPositions.map(
      async (openPosition) => {
        return db
          .doc(`openPositions/${openPosition.id}/groups/${groupID}`)
          .set(groupToGroupRef(newGroupData, groupID))
          .catch((err) =>
            console.error(
              'unable to update group ref on open position with id ' +
                openPosition.id +
                ' of group with id ' +
                groupID,
              err
            )
          );
      }
    );
    return Promise.all(openPositionsUpdatePromise);
  });

export const updateGroupRefOnTechniques = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const techniques: Technique[] = [];
    await db
      .collection(`groups/${groupID}/techniques`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const technique = ds.data() as Technique;
          technique.id = ds.id;
          techniques.push(technique);
        });
      })
      .catch((err) =>
        console.error(
          'unable to fetch techniques of group with id ' + groupID,
          err
        )
      );
    const techniquesUpdatePromise = techniques.map(async (technique) => {
      return db
        .doc(`techniques/${technique.id}/groups/${groupID}`)
        .set(groupToGroupRef(newGroupData, groupID))
        .catch((err) =>
          console.error(
            'unable to update group ref on technique with id ' +
              technique.id +
              ' of group with id ' +
              groupID,
            err
          )
        );
    });
    return Promise.all(techniquesUpdatePromise);
  });

export const updateGroupRefOnResearchFocuses = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const researchFocuses: ResearchFocus[] = [];
    await db
      .collection(`groups/${groupID}/researchFocuses`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((ds) => {
          const researchFocus = ds.data() as ResearchFocus;
          researchFocus.id = ds.id;
          researchFocuses.push(researchFocus);
        });
      })
      .catch((err) =>
        console.error(
          'unable to fetch research focuses of group with id ' + groupID,
          err
        )
      );
    const researchFocusesUpdatePromise = researchFocuses.map(
      async (researchFocus) => {
        return db
          .doc(`techniques/${researchFocus.id}/groups/${groupID}`)
          .set(groupToGroupRef(newGroupData, groupID))
          .catch((err) =>
            console.error(
              'unable to update group ref on research focus with id ' +
                researchFocus.id +
                ' of group with id ' +
                groupID,
              err
            )
          );
      }
    );
    return Promise.all(researchFocusesUpdatePromise);
  });

// When a new member (Mark) is added to a group by an existing member (Jenna),
// Mark is added to the group's members collection by Jenna. Jenna does not
// have permission to modify Mark's groups collection, so this function
// performs this reciprocal update.
export const addGroupToUserGroups = functions.firestore
  .document('groups/{groupID}/members/{userID}')
  .onCreate(async (_, context) => {
    const groupID = context.params.groupID;
    const userID = context.params.userID;
    const groupDS = await db
      .doc(`groups/${groupID}`)
      .get()
      .catch((err) => {
        console.log(`Unable to retrieve group with ID ${groupID}:`, err);
        throw new functions.https.HttpsError(
          'not-found',
          `Unable to retrieve group with ID ${groupID}.`
        );
      });
    const group = groupDS.data() as GroupRef;
    await db
      .doc(`users/${userID}/groups/${groupID}`)
      .set(group)
      .catch((err) => {
        console.log(
          `Unable to set group with ID ${groupID} on user ${userID} groups collection:`,
          err
        );
        throw new functions.https.HttpsError(
          'internal',
          `Unable to set group with ID ${groupID} on user ${userID} groups collection.`
        );
      });
    return true;
  });

// Converse of addGroupToUserGroups.
export const removeGroupFromUserGroups = functions.firestore
  .document('groups/{groupID}/members/{userID}')
  .onDelete(async (_, context) => {
    const groupID = context.params.groupID;
    const userID = context.params.userID;
    await db
      .doc(`users/${userID}/groups/${groupID}`)
      .delete()
      .catch((err) => {
        console.log(
          `Unable to remove group with ID ${groupID} from user ${userID} groups collection:`,
          err
        );
        throw new functions.https.HttpsError(
          'internal',
          `Unable to remove group with ID ${groupID} from user ${userID} groups collection.`
        );
      });
  });

// Adds group types to existing groups. Can be removed when issue #608 is
// promoted into all environments and this function has been run.
export const addGroupTypeToExistingGroups = functions.https.onCall(async () => {
  const groupCollectionRef = await db.collection('groups').get();
  const updatePromises: Promise<void | firestore.WriteResult>[] = [];
  groupCollectionRef.forEach((doc) => {
    const groupRef = doc.ref;
    const updatePromise = groupRef
      .update({groupType: 'researchGroup'})
      .catch((err) => console.error(err));
    updatePromises.push(updatePromise);
  });
  await Promise.all(updatePromises);
});

export function toGroupRef(groupID: string, group: any) {
  const groupRef: GroupRef = {
    id: groupID,
    name: group.name,
  };
  if (group.avatar) groupRef.avatar = group.avatar;
  if (group.about) groupRef.about = group.about;
  if (group.institution) groupRef.institution = group.institution;
  return groupRef;
}

export const verifyGroup = functions.https.onRequest(async (req, res) => {
  const groupID = req.body.data.groupID;
  if (!groupID) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `A group ID must be provided.`
    );
  }
  const verification: VerifiedGroup = {
    timestamp: new Date(),
  };
  await db
    .doc(`verifiedGroups/${groupID}`)
    .set(verification)
    .catch((err) => {
      console.error(`Unable to verify group ${groupID}:`, err);
      throw new functions.https.HttpsError(
        'internal',
        `Unable to verify group with ID ${groupID}.`
      );
    });
  res.status(200).send();
});

export const addOpenPositionTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/openPositions/{openPositionID}`)
  .onCreate(async (change, context) => {
    const openPosition = change.data() as OpenPosition;
    const openPositionTopics = openPosition.topics;
    const groupID = context.params.groupID;
    if (openPositionTopics && openPositionTopics.length > 0) {
      return addTopicsToGroup(openPositionTopics, groupID);
    }
    return null;
  });

export const removeOpenPositionTopicsFromGroup = functions.firestore
  .document(`groups/{groupID}/openPositions/{openPositionID}`)
  .onDelete(async (change, context) => {
    const openPosition = change.data() as OpenPosition;
    const openPositionTopics = openPosition.topics;
    const groupID = context.params.groupID;
    if (openPositionTopics && openPositionTopics.length > 0) {
      return removeTopicsFromGroup(openPositionTopics, groupID);
    }
    return null;
  });

export const addResearchFocusTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/researchFocuses/{researchFocusID}`)
  .onCreate(async (change, context) => {
    const researchFocus = change.data() as ResearchFocus;
    const researchFocusTopics = researchFocus.topics;
    const groupID = context.params.groupID;
    if (researchFocusTopics && researchFocusTopics.length > 0) {
      return addTopicsToGroup(researchFocusTopics, groupID);
    }
    return null;
  });

export const removeResearchFocusTopicsFromGroup = functions.firestore
  .document(`groups/{groupID}/researchFocuses/{researchFocusID}`)
  .onDelete(async (change, context) => {
    const researchFocus = change.data() as ResearchFocus;
    const researchFocusTopics = researchFocus.topics;
    const groupID = context.params.groupID;
    if (researchFocusTopics && researchFocusTopics.length > 0) {
      return removeTopicsFromGroup(researchFocusTopics, groupID);
    }
    return null;
  });

export const addTechniqueTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/techniques/{techniqueID}`)
  .onCreate(async (change, context) => {
    const technique = change.data() as Technique;
    const techniqueTopics = technique.topics;
    const groupID = context.params.groupID;
    if (techniqueTopics && techniqueTopics.length > 0) {
      return addTopicsToGroup(techniqueTopics, groupID);
    }
    return null;
  });

export const removeTechniqueTopicsFromGroup = functions.firestore
  .document(`groups/{groupID}/techniques/{techniqueID}`)
  .onDelete(async (change, context) => {
    const technique = change.data() as Technique;
    const techniqueTopics = technique.topics;
    const groupID = context.params.groupID;
    if (techniqueTopics && techniqueTopics.length > 0) {
      return removeTopicsFromGroup(techniqueTopics, groupID);
    }
    return null;
  });

// This also triggers the group to be added to the topic with the same rank
export const addPostTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const postTopics = post.topics;
    const groupID = context.params.groupID;
    if (postTopics && postTopics.length > 0) {
      return addTopicsToGroup(postTopics, groupID);
    }
    return null;
  });

// This also triggers the group to be added to the topic with the same rank
export const removePostTopicsFromGroup = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onDelete(async (change, context) => {
    const post = change.data() as Post;
    const postTopics = post.topics;
    const groupID = context.params.groupID;
    if (postTopics && postTopics.length > 0) {
      return removeTopicsFromGroup(postTopics, groupID);
    }
    return null;
  });

function addTopicsToGroup(topics: TaggedTopic[], groupID: string) {
  topics.forEach(async (topic) => {
    const groupTopic: Topic = {
      name: topic.name,
      normalisedName: topic.normalisedName,
      rank: 1,
      microsoftID: topic.microsoftID,
    };
    let topicID: string;
    if (!topic.id) {
      const collectedTopics: TaggedTopic[] = [];
      await addTopicIDToTaggedTopic(topic, collectedTopics);
      if (collectedTopics[0]) {
        topicID = collectedTopics[0].id;
      } else {
        return;
      }
    } else {
      topicID = topic.id;
    }
    const groupTopicDocRef = db.doc(`groups/${groupID}/topics/${topicID}`);
    return groupTopicDocRef
      .get()
      .then((ds: firestore.DocumentSnapshot) => {
        if (!ds.exists) {
          return groupTopicDocRef
            .set(groupTopic)
            .catch((err) =>
              console.error(
                'could not add topic with id ' +
                  groupTopic.id +
                  ' to group with id ' +
                  groupID +
                  ' while adding content to the group.',
                err
              )
            );
        } else {
          return groupTopicDocRef
            .update({
              rank: firestore.FieldValue.increment(1),
            })
            .catch((err) =>
              console.error(
                'could not increase rank of topic with id ' +
                  groupTopic.id +
                  ' while adding content to group with id ' +
                  groupID,
                err
              )
            );
        }
      })
      .catch((err) =>
        console.error(
          'could not fetch topic with id ' +
            groupTopic.id +
            ' while adding content to group with id ' +
            groupID,
          err
        )
      );
  });
}

function removeTopicsFromGroup(topics: TaggedTopic[], groupID: string) {
  topics.forEach(async (topic) => {
    let topicID: string;
    if (!topic.id) {
      const collectedTopics: TaggedTopic[] = [];
      await addTopicIDToTaggedTopic(topic, collectedTopics);
      if (collectedTopics[0]) {
        topicID = collectedTopics[0].id;
      } else {
        return;
      }
    } else {
      topicID = topic.id;
    }

    const groupTopicDocRef = db.doc(`groups/${groupID}/topics/${topicID}`);
    return groupTopicDocRef
      .get()
      .then((qs: any) => {
        if (!qs.exists) return;
        const topicRank = qs.data().rank;
        if (!topicRank || topicRank === 1) {
          groupTopicDocRef
            .delete()
            .catch((err) =>
              console.error(
                'could not delete topic with id ' +
                  topic.id +
                  ' on group with id ' +
                  groupID,
                err
              )
            );
        } else {
          groupTopicDocRef
            .update({rank: topicRank - 1})
            .catch((err) =>
              console.error(
                'could not decrease rank of topic with id ' +
                  topic.id +
                  ' on group with id ' +
                  groupID,
                err
              )
            );
        }
      })
      .catch((err) =>
        console.error(
          'could not fetch topic with id ' +
            topic.id +
            ' on group with id ' +
            groupID +
            ' while removing content from the group.',
          err
        )
      );
  });
}

export function groupToGroupRef(group: Group, groupID: string) {
  const groupRef = {
    id: groupID,
    name: group.name,
    avatar: group.avatar,
    about: group.about,
    institution: group.institution,
  } as GroupRef;
  return groupRef;
}

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

interface Group {
  id: string;
  name: string;
  groupType: string;
  avatar?: string;
  avatarCloudID?: string;
  about?: string;
  location?: string;
  website?: string;
  donationLink?: string;
  institution?: string;
}
