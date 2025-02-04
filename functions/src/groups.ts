import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
import {
  updateFilterCollection,
  Post,
  addRecentPostsToFollowingFeed,
  PostRef,
} from './posts';
import {
  Topic,
  removeTopicsFromResource,
  addTopicsToResource,
  TaggedTopic,
} from './topics';
import {Publication, PublicationRef} from './publications';
import {OpenPosition, OpenPositionListItem} from './openPositions';
import {
  ArticleBodyChild,
  ResearchFocus,
  ResearchFocusListItem,
} from './researchFocuses';
import {Technique, TechniqueListItem} from './techniques';
import {MAX_RECENT_TOPICS, toUserFilterRef, UserRef} from './users';
import {
  doFollowPreferencesBlockPost,
  FollowNoTopicsPreference,
  FollowPostTypePreferences,
} from './helpers';

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
        .file(`${oldAvatarPath}_fullSize`)
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

export const removeOldGroupCover = functions.firestore
  .document(`groups/{groupID}`)
  .onUpdate(async (change, context) => {
    const oldGroupData = change.before.data() as Group;
    const newGroupData = change.after.data() as Group;
    const groupID = context.params.groupID;
    const oldCoverPhotoCloudID = oldGroupData.coverPhotoCloudID;
    const newCoverPhotoCloudID = newGroupData.coverPhotoCloudID;
    if (oldCoverPhotoCloudID && oldCoverPhotoCloudID !== newCoverPhotoCloudID) {
      const oldCoverPhotoPath = `groups/${groupID}/coverPhoto/${oldCoverPhotoCloudID}`;
      return storage
        .bucket()
        .file(`${oldCoverPhotoPath}_fullSize`)
        .delete()
        .catch((err) =>
          console.error(
            'unable to delete old fullSize group coverPhoto with id ' +
              oldCoverPhotoCloudID +
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
        console.error(err, 'could not create postsFeed for new group')
      );
    await db
      .collection(`groups/${groupID}/feeds`)
      .doc(`publicationsFeed`)
      .set({id: 'publicationsFeed'})
      .catch((err) =>
        console.error(err, 'could not create publicationsFeed for new group')
      );
  });

export const addGroupMembersToPostFilter = functions.firestore
  .document('groups/{groupID}/posts/{postID}')
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const post = change.data() as Post;
    const groupPostsFeedRef = db.doc(`groups/${groupID}/feeds/postsFeed`);
    return updateFilterCollection(
      groupPostsFeedRef,
      {resourceName: 'Author', resourceType: ResourceTypes.USER},
      {
        name: post.author.name,
        id: post.author.id,
      },
      false
    ).catch((err) =>
      console.error(
        err,
        'could not update author option on group posts feed filter'
      )
    );
  });

export const removeGroupMembersFromPostFilter = functions.firestore
  .document('groups/{groupID}/posts/{postID}')
  .onDelete(async (change, context) => {
    const groupID = context.params.groupID;
    const post = change.data() as Post;
    const groupPostsFeedRef = db.doc(`groups/${groupID}/feeds/postsFeed`);
    return updateFilterCollection(
      groupPostsFeedRef,
      {resourceName: 'Author', resourceType: ResourceTypes.USER},
      {
        name: post.author.name,
        id: post.author.id,
      },
      true
    ).catch((err) =>
      console.error(
        err,
        'could not remove author option on group posts feed filter'
      )
    );
  });

export const addNewMemberToPublicationFilter = functions.firestore
  .document('groups/{groupID}/members/{memberID}')
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const memberID = context.params.memberID;
    const member = await db
      .doc(`users/${memberID}`)
      .get()
      .then((userDS) => userDS.data()!)
      .catch((err) =>
        console.error(
          'unable to fetch user doc for member with id ' +
            memberID +
            ' who just joined group with id ' +
            groupID,
          err
        )
      );
    if (!member) return;
    const memberPublications = await db
      .collection(`users/${memberID}/publications`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch publications for new group member with id ' +
            memberID,
          err
        )
      );
    if (!memberPublications || memberPublications.empty) return;
    const memberPublicationsIDs: string[] = [];
    memberPublications.forEach((publicationDS) => {
      const publicationID = publicationDS.id;
      memberPublicationsIDs.push(publicationID);
    });
    const matchedPublicationsOnGroup: string[] = [];
    const publicationMatchingPromises = memberPublicationsIDs.map(
      (newMemberPublicationID) =>
        db
          .doc(`groups/${groupID}/publications/${newMemberPublicationID}`)
          .get()
          .then((matchedPublicationDS) => {
            if (!matchedPublicationDS.exists) return;
            matchedPublicationsOnGroup.push(matchedPublicationDS.id);
          })
          .catch((err) =>
            console.error(
              'unable to fetch publication with id ' +
                newMemberPublicationID +
                ' on group with id ' +
                groupID,
              err
            )
          )
    );
    await Promise.all(publicationMatchingPromises);
    if (matchedPublicationsOnGroup.length === 0) return;
    const groupPublicationsUserCollectionRef = db.doc(
      `groups/${groupID}/feeds/publicationsFeed/filterCollections/user`
    );
    const groupPublicationsUserOptionRef = groupPublicationsUserCollectionRef
      .collection('filterOptions')
      .doc(memberID);
    const filterCollectionRank: number = await groupPublicationsUserCollectionRef
      .get()
      .then((ds) => ds.data()!.rank)
      .catch((err) =>
        console.error(
          'unable to fetch publications user filter collection on group with id ' +
            groupID,
          err
        )
      );

    const batch = db.batch();
    batch.set(
      groupPublicationsUserOptionRef,
      toUserFilterRef(member.name, memberID, matchedPublicationsOnGroup.length)
    );
    if (filterCollectionRank)
      batch.update(groupPublicationsUserCollectionRef, {
        rank: filterCollectionRank + matchedPublicationsOnGroup.length,
      });
    return await batch.commit();
  });

export const addGroupMembersToPublicationFilter = functions.firestore
  .document('groups/{groupID}/publications/{publicationID}')
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const publication = change.data() as Publication;
    const groupPublicationsFeedRef = db.doc(
      `groups/${groupID}/feeds/publicationsFeed`
    );
    const updateFilterPromises = publication.authors!.map((author) => {
      const authorID = author.id;
      if (!authorID) return;
      return db
        .doc(`users/${authorID}/groups/${groupID}`)
        .get()
        .then(async (userGroupsDS) => {
          if (!userGroupsDS.exists) return;
          return updateFilterCollection(
            groupPublicationsFeedRef,
            {resourceName: 'Author', resourceType: ResourceTypes.USER},
            {
              name: author.name,
              id: authorID,
            },
            false
          );
        })
        .catch((err) =>
          console.error(
            'could not fetch groups for user with id ' + authorID,
            err
          )
        );
    });
    return Promise.all(updateFilterPromises);
  });

export const removeGroupMembersFromPublicationFilter = functions.firestore
  .document('groups/{groupID}/publications/{publicationID}')
  .onDelete(async (change, context) => {
    const groupID = context.params.groupID;
    const publication = change.data() as Publication;
    const groupPublicationsFeedRef = db.doc(
      `groups/${groupID}/feeds/publicationsFeed`
    );
    const updateFilterPromises = publication.authors!.map((author) => {
      if (!author.id) return;
      return updateFilterCollection(
        groupPublicationsFeedRef,
        {resourceName: 'Author', resourceType: ResourceTypes.USER},
        {
          name: author.name,
          id: author.id,
        },
        true
      ).catch((err) =>
        console.error(
          err,
          'could not update author option on group publications feed filter'
        )
      );
    });
    return Promise.all(updateFilterPromises);
  });

export const addGroupToRelatedTopicPage = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onCreate(async (change, context) => {
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    return setGroupOnTopic(groupID, topicID);
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
        console.error(
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
  return db
    .doc(`groups/${groupID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) return;
      const group = ds.data() as Group;
      const groupRef = groupToGroupRef(group, groupID);
      groupRef.rank = rank ? rank : 1;
      return groupInTopicDocRef
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
      console.error(err, 'could not fetch group with id ' + groupID)
    );
}

export const incrementPhotosCountOnGroupDoc = functions.firestore
  .document('groups/{groupID}/photos/{photoID}')
  .onCreate((change, context) => {
    const groupID = context.params.groupID;
    return db
      .doc(`groupsStats/${groupID}`)
      .set({photoCount: firestore.FieldValue.increment(1)}, {merge: true});
  });

export const updateGroupRankOnTopic = functions.firestore
  .document('groups/{groupID}/topics/{topicID}')
  .onUpdate(async (change, context) => {
    const topic = change.after.data() as Topic;
    const topicID = context.params.topicID;
    const groupID = context.params.groupID;
    const topicUpdatePromise = await db
      .doc(`topics/${topicID}/groups/${groupID}`)
      .update({rank: topic.rank})
      .then(() => true)
      .catch((err) => {
        console.error(
          'unable to update rank on group with id ' +
            groupID +
            ' in topic with id ' +
            topicID,
          err
        );
        return false;
      });
    if (topicUpdatePromise) return;
    return setGroupOnTopic(groupID, topicID, topic.rank);
  });

export const updateGroupRefOnTopics = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
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
      const groupWithTopicSpecificRank = {...newGroupData};
      groupWithTopicSpecificRank.rank = topic.rank;
      return db
        .doc(`topics/${topic.id}/groups/${groupID}`)
        .set(groupToGroupRef(groupWithTopicSpecificRank, groupID))
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

export const updateGroupRefOnFollowers = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
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
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
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

export const updateGroupRefOnOpenPositions = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
    const openPositionQS = await db
      .collection(`groups/${groupID}/openPositions`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch open positions of group with id ' + groupID,
          err
        )
      );
    if (!openPositionQS || openPositionQS.empty) return;
    const openPositionsIDs: string[] = [];
    openPositionQS.forEach((ds) => {
      const openPositionID = ds.id;
      openPositionsIDs.push(openPositionID);
    });
    const openPositionsUpdatePromise = openPositionsIDs.map(
      async (openPositionID) => {
        return db
          .doc(`openPositions/${openPositionID}`)
          .update({group: groupToGroupRef(newGroupData, groupID)})
          .catch((err) =>
            console.error(
              'unable to update group ref on open position with id ' +
                openPositionID +
                ' for group with id ' +
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
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
    const techniquesQS = await db
      .collection(`groups/${groupID}/techniques`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch techniques of group with id ' + groupID,
          err
        )
      );
    if (!techniquesQS || techniquesQS.empty) return;
    const techniquesIDs: string[] = [];
    techniquesQS.forEach((ds) => {
      const techniqueID = ds.id;
      techniquesIDs.push(techniqueID);
    });
    const techniquesUpdatePromise = techniquesIDs.map(async (techniqueID) => {
      return db
        .doc(`techniques/${techniqueID}`)
        .update({group: groupToGroupRef(newGroupData, groupID)})
        .catch((err) =>
          console.error(
            'unable to update group ref on technique with id ' +
              techniqueID +
              ' for group with id ' +
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
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
    const researchFocusesQS = await db
      .collection(`groups/${groupID}/researchFocuses`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch research focuses of group with id ' + groupID,
          err
        )
      );
    if (!researchFocusesQS || researchFocusesQS.empty) return;
    const researchFocusesIDs: string[] = [];
    researchFocusesQS.forEach((ds) => {
      const researchFocusID = ds.id;
      researchFocusesIDs.push(researchFocusID);
    });
    const researchFocusesUpdatePromise = researchFocusesIDs.map(
      async (researchFocusID) => {
        return db
          .doc(`researchFocuses/${researchFocusID}`)
          .update({group: groupToGroupRef(newGroupData, groupID)})
          .catch((err) =>
            console.error(
              'unable to update group ref on research focus with id ' +
                researchFocusID +
                ' for group with id ' +
                groupID,
              err
            )
          );
      }
    );
    return Promise.all(researchFocusesUpdatePromise);
  });

export const updateGroupRefOnPosts = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
    const postsQS = await db
      .collection(`groups/${groupID}/posts`)
      .get()
      .catch((err) =>
        console.error('unable to fetch posts of group with id ' + groupID, err)
      );
    if (!postsQS || postsQS.empty) return;
    const postsIDs: string[] = [];
    postsQS.forEach((ds) => {
      const postID = ds.id;
      postsIDs.push(postID);
    });
    const postsUpdatePromise = postsIDs.map(async (postID) => {
      return db
        .doc(`posts/${postID}/groups/${groupID}`)
        .set(groupToGroupRef(newGroupData, groupID))
        .catch((err) =>
          console.error(
            'unable to update group ref on post with id ' +
              postID +
              ' for group with id ' +
              groupID,
            err
          )
        );
    });
    return Promise.all(postsUpdatePromise);
  });

export const updateGroupRefOnPublications = functions.firestore
  .document('groups/{groupID}')
  .onUpdate(async (change, context) => {
    const newGroupData = change.after.data() as Group;
    const oldGroupData = change.before.data() as Group;
    const groupID = context.params.groupID;
    if (
      JSON.stringify(groupToGroupRef(newGroupData, groupID)) ===
      JSON.stringify(groupToGroupRef(oldGroupData, groupID))
    )
      return;
    const publicationsQS = await db
      .collection(`groups/${groupID}/publications`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch publications of group with id ' + groupID,
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
        return db
          .doc(`publications/${publicationID}/groups/${groupID}`)
          .set(groupToGroupRef(newGroupData, groupID))
          .catch((err) =>
            console.error(
              'unable to update group ref on publication with id ' +
                publicationID +
                ' for group with id ' +
                groupID,
              err
            )
          );
      }
    );
    return Promise.all(publicationsUpdatePromise);
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
        console.error(`Unable to retrieve group with ID ${groupID}:`, err);
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
        console.error(
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
        console.error(
          `Unable to remove group with ID ${groupID} from user ${userID} groups collection:`,
          err
        );
        throw new functions.https.HttpsError(
          'internal',
          `Unable to remove group with ID ${groupID} from user ${userID} groups collection.`
        );
      });
  });

export function toGroupRef(groupID: string, group: any) {
  const groupRef: GroupRef = {
    id: groupID,
    name: group.name,
    about: group.about,
  };
  if (group.avatar) groupRef.avatar = group.avatar;
  if (group.institution) groupRef.institution = group.institution;
  return groupRef;
}

export const verifyGroup = functions.https.onRequest(async (req, res) => {
  const groupID = req.body.data.groupID;
  if (!groupID) {
    res.status(400).send('Request should have groupID.');
    return;
  }
  const verification: VerifiedGroup = {
    timestamp: new Date(),
  };
  await db
    .doc(`verifiedGroups/${groupID}`)
    .set(verification)
    .catch((err) => {
      console.error(`Unable to verify group ${groupID}:`, err);
      res.status(500).send('Unable verify group.');
      return;
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
      return await addTopicsToResource(openPositionTopics, groupID, 'group');
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
      return await removeTopicsFromResource(
        openPositionTopics,
        groupID,
        'group'
      );
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
      return await addTopicsToResource(researchFocusTopics, groupID, 'group');
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
      return await removeTopicsFromResource(
        researchFocusTopics,
        groupID,
        'group'
      );
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
      return await addTopicsToResource(techniqueTopics, groupID, 'group');
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
      return await removeTopicsFromResource(techniqueTopics, groupID, 'group');
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
      return await addTopicsToResource(postTopics, groupID, 'group');
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
      return await removeTopicsFromResource(postTopics, groupID, 'group');
    }
    return null;
  });

export const addPublicationTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/publications/{publicationID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const publication = change.data();
    const publicationTopics = publication.topics;
    if (!publicationTopics || publicationTopics.length === 0) return null;
    return await addTopicsToResource(publicationTopics, groupID, 'group');
  });

export const removePublicationTopicsToGroup = functions.firestore
  .document(`groups/{groupID}/publications/{publicationID}`)
  .onDelete(async (change, context) => {
    const groupID = context.params.groupID;
    const publication = change.data();
    const publicationTopics = publication.topics;
    if (!publicationTopics || publicationTopics.length === 0) return null;
    return await removeTopicsFromResource(publicationTopics, groupID, 'group');
  });

export const addRecentPostsToFeedOnNewGroupFollow = functions.firestore
  .document('groups/{followedGroupID}/followedByUsers/{followerID}')
  .onCreate(
    async (_, context): Promise<void[]> => {
      const followerID = context.params.followerID;
      const followedGroupID = context.params.followedGroupID;
      return await addRecentPostsToFollowingFeed(
        followerID,
        db.collection(`groups/${followedGroupID}/posts`)
      );
    }
  );

export const addGroupPostToFollowersFeeds = functions.firestore
  .document('groups/{groupID}/posts/{postID}')
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const postID = context.params.postID;
    const post = change.data() as Post;
    const groupFollowersCollectionRef = db.collection(
      `groups/${groupID}/followedByUsers`
    );
    const groupFollowersQS = await groupFollowersCollectionRef
      .get()
      .catch((err) =>
        console.log(
          err,
          'could not fetch followers of group with id ' + groupID
        )
      );
    if (!groupFollowersQS || groupFollowersQS.empty) return;

    const groupFollowersIDs: string[] = [];
    groupFollowersQS.forEach((ds) => {
      const followerData = ds.data();
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
      groupFollowersIDs.push(ds.id);
    });

    const groupFollowersPromisesArray = groupFollowersIDs.map(
      async (groupFollowerID) => {
        const userPostsDocRef = db.doc(
          `users/${groupFollowerID}/feeds/followingFeed/posts/${postID}`
        );
        const existingPost = await userPostsDocRef
          .get()
          .catch((err) =>
            console.error(
              'unable to check if post with id ' +
                postID +
                ' already exists on following feed of user with id ' +
                groupFollowerID,
              err
            )
          );
        if (existingPost && existingPost.data()) return;
        const batch = db.batch();
        batch.set(userPostsDocRef, post);
        batch.set(
          db.doc(`posts/${postID}/onFollowingFeedsOfUsers/${groupFollowerID}`),
          {id: groupFollowerID}
        );
        return batch
          .commit()
          .catch((err) =>
            console.log(
              err,
              'failed to add post from group with id ' +
                groupID +
                ' to user following feed with id ' +
                groupFollowerID
            )
          );
      }
    );
    return Promise.all(groupFollowersPromisesArray);
  });

export const addPostTopicsToRecentGroupTopics = functions.firestore
  .document('groups/{groupID}/posts/{postID}')
  .onCreate(async (change, context) => {
    const post = change.data() as PostRef;
    const groupID = context.params.groupID;
    const topics = post.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToGroupDoc(
      groupID,
      topics,
      'recentPostTopics'
    );
  });

export const addPublicationTopicsToRecentGroupTopics = functions.firestore
  .document('groups/{groupID}/publications/{publicationID}')
  .onCreate(async (change, context) => {
    const publication = change.data() as PublicationRef;
    const groupID = context.params.groupID;
    const topics = publication.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToGroupDoc(
      groupID,
      topics,
      'recentPublicationTopics'
    );
  });

export const addResearchFocusTopicsToRecentGroupTopics = functions.firestore
  .document('groups/{groupID}/researchFocuses/{researchFocusID}')
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const groupID = context.params.groupID;
    const topics = post.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToGroupDoc(
      groupID,
      topics,
      'recentArticleTopics'
    );
  });

export const addTechniqueTopicsToRecentGroupTopics = functions.firestore
  .document('groups/{groupID}/techniques/{techniqueID}')
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const groupID = context.params.groupID;
    const topics = post.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToGroupDoc(
      groupID,
      topics,
      'recentArticleTopics'
    );
  });

export const addOpenPosTopicsToRecentGroupTopics = functions.firestore
  .document('groups/{groupID}/openPositions/{openPositionID}')
  .onCreate(async (change, context) => {
    const post = change.data() as Post;
    const groupID = context.params.groupID;
    const topics = post.topics;
    if (!topics || topics.length === 0) return;
    return addRecentResourceTopicsToGroupDoc(
      groupID,
      topics,
      'recentArticleTopics'
    );
  });

async function getGroupDocDS(groupID: string) {
  return db
    .doc(`groups/${groupID}`)
    .get()
    .catch((err) =>
      console.error(
        `unable to fetch pinned item for group with id ${groupID} ${err}`
      )
    );
}
async function checkThenUpdatePinnedItemOnGroup(
  groupData: Group,
  itemData: any,
  groupID: string,
  itemID: string,
  resourceType: string
) {
  const pinnedItem = groupData.pinnedItem;
  if (!pinnedItem) return;
  const isPinned = pinnedItem.id === itemID;
  if (!isPinned) return;
  itemData.id = itemID;
  itemData.resourceType = resourceType;
  return db
    .doc(`groups/${groupID}`)
    .update({pinnedItem: itemData})
    .catch((err) =>
      console.error(
        `unable to update pinned item on group with id ${groupID} ${err}`
      )
    );
}

export const updatePinnedPost = functions.firestore
  .document('groups/{groupID}/posts/{postID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const postID = context.params.postID;
    const groupDocDS = await getGroupDocDS(groupID);
    if (!groupDocDS || !groupDocDS.exists) return;
    const groupData = groupDocDS.data() as Group;
    const postData = change.after.data() as PostRef;
    return checkThenUpdatePinnedItemOnGroup(
      groupData,
      postData,
      groupID,
      postID,
      ResourceTypes.POST
    );
  });

export const updatePinnedPublication = functions.firestore
  .document('groups/{groupID}/publications/{publicationID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const publicationID = context.params.publicationID;
    const groupDocDS = await getGroupDocDS(groupID);
    if (!groupDocDS || !groupDocDS.exists) return;
    const publicationData = change.after.data() as PublicationRef;
    const groupData = groupDocDS.data() as Group;
    return checkThenUpdatePinnedItemOnGroup(
      groupData,
      publicationData,
      groupID,
      publicationID,
      ResourceTypes.PUBLICATION
    );
  });

export const updatePinnedOpenPosition = functions.firestore
  .document('groups/{groupID}/openPositions/{openPositionID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const openPositionID = context.params.openPositionID;
    const groupDocDS = await getGroupDocDS(groupID);
    if (!groupDocDS || !groupDocDS.exists) return;
    const openPositionData = change.after.data() as OpenPositionListItem;
    const groupData = groupDocDS.data() as Group;
    return checkThenUpdatePinnedItemOnGroup(
      groupData,
      openPositionData,
      groupID,
      openPositionID,
      ResourceTypes.OPEN_POSITION
    );
  });

export const updatePinnedResearchFocus = functions.firestore
  .document('groups/{groupID}/researchFocuses/{researchFocusID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const researchFocusID = context.params.researchFocusID;
    const groupDocDS = await getGroupDocDS(groupID);
    if (!groupDocDS || !groupDocDS.exists) return;
    const researchFocusData = change.after.data() as ResearchFocusListItem;
    const groupData = groupDocDS.data() as Group;
    return checkThenUpdatePinnedItemOnGroup(
      groupData,
      researchFocusData,
      groupID,
      researchFocusID,
      ResourceTypes.RESEARCH_FOCUS
    );
  });

export const updatePinnedTechnique = functions.firestore
  .document('groups/{groupID}/techniques/{techniqueID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const techniqueID = context.params.techniqueID;
    const groupDocDS = await getGroupDocDS(groupID);
    if (!groupDocDS || !groupDocDS.exists) return;
    const techniqueData = change.after.data() as TechniqueListItem;
    const groupData = groupDocDS.data() as Group;
    return checkThenUpdatePinnedItemOnGroup(
      groupData,
      techniqueData,
      groupID,
      techniqueID,
      ResourceTypes.TECHNIQUE
    );
  });

export const updateNewsPost = functions.firestore
  .document('groups/{groupID}/posts/{postID}')
  .onUpdate(async (change, context) => {
    const groupID = context.params.groupID;
    const postID = context.params.postID;
    const postData = change.after.data() as PostRef;
    const newsRef = db.doc(`groups/${groupID}/news/${postID}`);
    const isNews = await newsRef
      .get()
      .then((ds) => {
        if (!ds.exists) return false;
        return ds.data();
      })
      .catch((err) => {
        console.error(
          `unable to fetch news for group with id ${groupID} ${err}`
        );
        return false;
      });
    if (!isNews) return;
    return newsRef
      .set(postData)
      .catch((err) =>
        console.error(
          `unable to update news with id ${postID} on group with id ${groupID} ${err}`
        )
      );
  });

async function addRecentResourceTopicsToGroupDoc(
  groupID: string,
  newTopics: TaggedTopic[],
  targetField:
    | 'recentArticleTopics'
    | 'recentPublicationTopics'
    | 'recentPostTopics'
) {
  const groupRef = db.doc(`groups/${groupID}`);
  const groupDocData = await groupRef
    .get()
    .then((ds) => ds.data() as Group)
    .catch((err) =>
      console.error(`unable to get group doc for group ${groupID} ${err}`)
    );
  if (!groupDocData) return;
  const currentRecentTopics = groupDocData[targetField] as TaggedTopic[];
  let newRecentTopics;
  if (!currentRecentTopics) newRecentTopics = newTopics;
  else {
    newRecentTopics = currentRecentTopics;
    newTopics.forEach((topic) => newRecentTopics.unshift(topic));
  }
  if (newRecentTopics.length > MAX_RECENT_TOPICS)
    newRecentTopics.splice(MAX_RECENT_TOPICS);
  return groupRef.set(
    {
      [targetField]: newRecentTopics,
    },
    {merge: true}
  );
}

export function groupToGroupRef(group: Group, groupID: string) {
  const groupRef = {
    id: groupID,
    name: group.name,
    about: group.about,
    institution: group.institution,
    groupType: group.groupType,
  } as GroupRef;

  if (group.avatar) groupRef.avatar = group.avatar;
  if (group.rank) groupRef.rank = group.rank;
  return groupRef;
}

export function groupToAlgoliaGroupRef(
  group: Group,
  groupID: string
): AlgoliaGroupRef {
  const groupAlgoliaRef = {
    objectID: groupID,
    name: group.name,
    about: group.about,
    institution: group.institution,
    unformattedAbout: group.about.reduce(
      (accumulator, current) => accumulator + current.children[0].text + ' ',
      ''
    ),
    groupType: group.groupType,
    resourceType: ResourceTypes.GROUP,
  } as AlgoliaGroupRef;

  if (group.avatar) groupAlgoliaRef.avatar = group.avatar;
  if (group.recentPostTopics)
    groupAlgoliaRef.recentPostTopics = group.recentPostTopics;
  if (group.recentPublicationTopics)
    groupAlgoliaRef.recentPublicationTopics = group.recentPublicationTopics;
  if (group.recentArticleTopics)
    groupAlgoliaRef.recentArticleTopics = group.recentArticleTopics;
  return groupAlgoliaRef;
}

export function groupRefToGroupSignature(groupRef: GroupRef, groupID: string) {
  const groupSignature: GroupSignature = {
    id: groupID,
    name: groupRef.name,
  };
  if (groupRef.avatar) groupSignature.avatar = groupRef.avatar;
  if (groupRef.institution) groupSignature.institution = groupRef.institution;
  return groupSignature;
}
interface VerifiedGroup {
  timestamp: Date;
}

// Rank relates to how often the group posts about this topic
export interface GroupRef {
  id: string;
  name: string;
  avatar?: string;
  about: ArticleBodyChild[];
  institution?: string;
  rank?: number;
}

export interface AlgoliaGroupRef {
  objectID: string;
  name: string;
  avatar?: string;
  about: ArticleBodyChild[];
  institution?: string;
  recentPostTopics?: TaggedTopic[];
  recentPublicationTopics?: TaggedTopic[];
  recentArticleTopics?: TaggedTopic[];
  unformattedAbout: string;
  resourceType: string;
  groupType: string;
}

export interface Group {
  id: string;
  name: string;
  groupType: string;
  avatar?: string;
  avatarCloudID?: string;
  coverPhotoCloudID?: string;
  coverPhoto?: string;
  about: ArticleBodyChild[];
  location?: string;
  website?: string;
  donationLink?: string;
  institution?: string;
  rank?: number;
  recentPostTopics?: TaggedTopic[];
  recentPublicationTopics?: TaggedTopic[];
  recentArticleTopics?: TaggedTopic[];
  isGeneratedFromTwitter?: boolean;
  pinnedItem: any;
}

export interface GroupSignature {
  id: string;
  name: string;
  avatar?: string;
  institution?: string;
}
