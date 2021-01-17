import * as functions from 'firebase-functions';
import {firestore} from 'firebase-admin';
import {admin, environment} from './config';
import {
  interpretQuery,
  executeExpression,
  MAKPublication,
  makPublicationToPublication,
  interpretationResult,
  MAKAuthor,
} from './microsoft';
import {Post} from './posts';
import {Topic} from './topics';
import {
  publishAddPublicationRequests,
  allPublicationFields,
  Publication,
} from './publications';

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
          .file(oldCoverPhotoPath)
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
          .file(oldAvatarPath)
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

export const addUserToRelatedTopicPage = functions.firestore
  .document('users/{userID}/topics/{topicID}')
  .onCreate(async (change, context) => {
    const topic = change.data() as Topic;
    const userID = context.params.userID;
    const topicID = context.params.topicID;
    setUserOnTopic(topic, topicID, userID).catch((err) =>
      console.log(err, 'could not add user to topic')
    );
  });

export const updateUserOnRelatedTopicPage = functions.firestore
  .document('users/{userID}/topics/{topicID}')
  .onUpdate(async (change, context) => {
    const topic = change.after.data() as Topic;
    const topicID = context.params.topicID;
    const userID = context.params.userID;
    setUserOnTopic(topic, topicID, userID).catch((err) =>
      console.log(err, 'could not update user rank on topic')
    );
  });

export const updateUserRefOnResearchFocuses = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const userID = context.params.userID;
    const researchFocusesQS = await db
      .collection(`users/${userID}/researchFocuses`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch research focuses of user with id ' + userID,
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
          .update({author: toUserRef(userID, newUserData)})
          .catch((err) =>
            console.error(
              'unable to update user ref on research focus with id ' +
                researchFocusID +
                ' for user with id ' +
                userID,
              err
            )
          );
      }
    );
    return Promise.all(researchFocusesUpdatePromise);
  });

export const updateUserRefOnOpenPositions = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const userID = context.params.userID;
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
          .update({author: toUserRef(userID, newUserData)})
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

export const updateUserRefOnTechniques = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const userID = context.params.userID;
    const techniquesQS = await db
      .collection(`users/${userID}/techniques`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch techniques of user with id ' + userID,
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
        .update({author: toUserRef(userID, newUserData)})
        .catch((err) =>
          console.error(
            'unable to update user ref on technique with id ' +
              techniqueID +
              ' for user with id ' +
              userID,
            err
          )
        );
    });
    return Promise.all(techniquesUpdatePromise);
  });

export const updateUserRefOnMemberGroups = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const userID = context.params.userID;
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
        .set(toUserRef(userID, newUserData))
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
    const userID = context.params.userID;
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
    const userID = context.params.userID;
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
    const userID = context.params.userID;
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
    const userID = context.params.userID;
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

export const updateUserRefOnPost = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const userID = context.params.userID;
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
        .update({author: toUserRef(userID, newUserData)})
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

export const updateUserRefOnTopic = functions.firestore
  .document('users/{userID}')
  .onUpdate(async (change, context) => {
    const newUserData = change.after.data() as User;
    const userID = context.params.userID;
    const topicsQS = await db
      .collection(`users/${userID}/topics`)
      .get()
      .catch((err) =>
        console.error('unable to fetch topics for user with id ' + userID, err)
      );
    if (!topicsQS || topicsQS.empty) return;
    const topicsIDs: string[] = [];
    topicsQS.forEach((ds) => {
      const topicID = ds.id;
      topicsIDs.push(topicID);
    });
    const topicsUpdatePromise = topicsIDs.map(async (topicID) => {
      return db
        .doc(`topics/${topicID}/users/${userID}`)
        .set(toUserRef(userID, newUserData))
        .catch((err) =>
          console.error(
            'unable to update user ref on topic with id ' +
              topicID +
              ' for user with id ' +
              userID,
            err
          )
        );
    });
    return Promise.all(topicsUpdatePromise);
  });

export async function setUserOnTopic(
  topic: Topic,
  topicID: string,
  userID: string
) {
  const userInTopicDocRef = db.doc(`topics/${topicID}/users/${userID}`);
  await db
    .doc(`users/${userID}`)
    .get()
    .then((qs) => {
      if (!qs.exists) return;
      const user = qs.data() as UserRef;
      const userRef = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        rank: topic.rank,
      };
      userInTopicDocRef
        .set(userRef)
        .catch((err) => console.log(err, 'could not set user on topic'));
    })
    .catch((err) => console.log(err, 'could not search for user'));
}

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

    const microsoftAcademicAuthorID = data.microsoftAcademicAuthorID.toString();
    if (microsoftAcademicAuthorID === undefined)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide selected publication suggestions'
      );

    const userToBeLinkedDBRef = db.doc(`users/${userID}`);
    const user = await userToBeLinkedDBRef
      .get()
      .then((ds) => {
        if (!ds.exists) return;
        return ds.data() as User;
      })
      .catch((err) => console.log(err, 'could not fetch user to be linked'));
    if (!user)
      throw new functions.https.HttpsError(
        'not-found',
        `No user found with ID ${userID}`
      );
    if (user.microsoftID !== undefined)
      throw new functions.https.HttpsError(
        'already-exists',
        `User with id ${userID} is already linked to a microsoft id`
      );

    const MSUser = await db
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
    if (!MSUser)
      throw new functions.https.HttpsError(
        'not-found',
        `No MSUser found with ID ${microsoftAcademicAuthorID}`
      );

    if (MSUser.processed)
      throw new functions.https.HttpsError(
        'already-exists',
        `MSUser with id ${microsoftAcademicAuthorID} is already linked to a labspoon user`
      );

    // give functions some time to create publications
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 3000);
    });
    const msPublicationsForUserQS = await db
      .collection(`MSUsers/${microsoftAcademicAuthorID}/publications`)
      .get()
      .catch((err) => {
        console.log(
          'unable to fetch publications for MSUser with id ' +
            microsoftAcademicAuthorID,
          err
        );
        throw new functions.https.HttpsError(
          'internal',
          'unable to fetch publications for MSUser with id ' +
            microsoftAcademicAuthorID,
          err
        );
      });

    const batch = db.batch();
    batch.update(userToBeLinkedDBRef, {
      microsoftID: microsoftAcademicAuthorID,
    });
    batch.update(db.doc(`MSUsers/${microsoftAcademicAuthorID}`), {
      processed: userID,
    });
    if (msPublicationsForUserQS) {
      const publicationWritePromises: Promise<null>[] = [];
      msPublicationsForUserQS.forEach((msPublicationDS) =>
        publicationWritePromises.push(
          (async () => {
            const msPublicationData = msPublicationDS.data();
            if (!msPublicationData) return null;
            const labspoonPublicationID = msPublicationData.processed;
            if (!labspoonPublicationID) {
              console.log(
                'Processed field for Microsoft Publication with id ',
                msPublicationDS.id,
                ' is undefined. This should not happen and likely indicates a logic issue.'
              );
              return null;
            }
            const labspoonPublicationDS = await db
              .doc(`publications/${labspoonPublicationID}`)
              .get()
              .catch((err) =>
                console.error(
                  'unable to fetch publication with id ' +
                    labspoonPublicationID,
                  err
                )
              );
            if (!labspoonPublicationDS || !labspoonPublicationDS.exists)
              return null;
            const labspoonPublication = labspoonPublicationDS.data();
            if (!labspoonPublication) return null;
            batch.set(
              db.doc(`users/${userID}/publications/${labspoonPublicationID}`),
              labspoonPublication
            );
            const authorItem = labspoonPublication.authors.filter(
              (author: any) => author.microsoftID === microsoftAcademicAuthorID
            )[0];
            user.microsoftID = microsoftAcademicAuthorID;
            if (authorItem) {
              batch.update(db.doc(`publications/${labspoonPublicationID}`), {
                authors: firestore.FieldValue.arrayRemove(authorItem),
              });
              batch.update(db.doc(`publications/${labspoonPublicationID}`), {
                authors: firestore.FieldValue.arrayUnion(
                  toUserRef(userID, user)
                ),
              });
            }
            return null;
          })()
        )
      );
      await Promise.all(publicationWritePromises).catch((err) =>
        console.error(err)
      );
    }

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

// If we are running the functions locally, we don't want to brick the
// emulators with too many add publication requests, so we use a smaller number
// of interpretations and smaller page size for each of those interpretations.
const SUGGESTED_PUBLICATIONS_INTERPRETATIONS_COUNT =
  environment === 'local' ? 1 : 10;
const SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE =
  environment === 'local' ? 10 : 100;

// for a given name, return potential matching publications so the user can select theirs
export const getSuggestedPublicationsForAuthorName = functions.https.onCall(
  async (data) => {
    const name = data.name;
    if (name === undefined)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'A name must be provided'
      );
    // retrieve expressions for retrieving results related to the search query
    const expressions: Array<string> = await interpretQuery({
      query: name as string,
      complete: 1,
      count: SUGGESTED_PUBLICATIONS_INTERPRETATIONS_COUNT,
    })
      .then((resp) =>
        resp.data.interpretations.map(
          // TODO: filter out non-author rules
          (result: interpretationResult) => result.rules[0].output.value
        )
      )
      .catch((err) => {
        console.error(err);
        throw new functions.https.HttpsError('internal', 'An error occurred.');
      });
    const executePromises = expressions.map(async (expression) => {
      return executeExpression({
        expr: expression,
        count: SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE,
        attributes: allPublicationFields,
      })
        .then(async (resp) => {
          const makPublications: MAKPublication[] = resp.data.entities;
          await publishAddPublicationRequests(makPublications);
          return resp;
        })
        .then((resp) => {
          const evaluateExpression = resp.data.expr;
          const normalisedAuthorNameRegex = /AA\.AuN=='(?<name>[a-z ]*)'/;
          const authorMatches = normalisedAuthorNameRegex.exec(
            evaluateExpression
          );
          if (!authorMatches) {
            console.warn(
              'Could not extract a normalised author name from the evaluate expression:',
              evaluateExpression
            );
            return undefined;
          }
          // get the first capturing group in the regex match
          const normalisedAuthorName = authorMatches[1];
          const makPublications: MAKPublication[] = resp.data.entities;
          const publications: PublicationSuggestion[] = [];
          makPublications.forEach((entity: MAKPublication) => {
            const publication = makPublicationToPublication(entity);
            const authors = publication.authors!;
            const matchingAuthor = authors.find(
              (author) => author.normalisedName === normalisedAuthorName
            )!;
            if (!matchingAuthor.microsoftID) return;
            const publicationSuggestion: PublicationSuggestion = {
              microsoftAcademicIDMatch: matchingAuthor.microsoftID,
              publicationInfo: publication,
            };
            publications.push(publicationSuggestion);
          });
          // want to return a maximum of two papers per author
          const seenAuthorIDs = new Map();
          return publications.filter((publicationSuggestion) => {
            const matchingAuthorID =
              publicationSuggestion.microsoftAcademicIDMatch;
            if (seenAuthorIDs.get(matchingAuthorID) === 2) return false;
            if (seenAuthorIDs.get(matchingAuthorID) === 1)
              seenAuthorIDs.set(matchingAuthorID, 2);
            if (!seenAuthorIDs.has(matchingAuthorID))
              seenAuthorIDs.set(matchingAuthorID, 1);
            return true;
          });
        })
        .catch((err) => {
          console.error(err);
          throw new functions.https.HttpsError(
            'internal',
            'An error occurred.'
          );
        });
    });
    const publicationsByInterpretation = await Promise.all(executePromises);
    const suggestedPublications = flatten(publicationsByInterpretation);
    // filter out null values
    return suggestedPublications.filter(Boolean);
  }
);

const flatten = function (arr: Array<any>, result: Array<any> = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
};

export const addPostsInTopicToFollowingFeeds = functions.firestore
  .document(`topics/{topicID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const topicID = context.params.topicID;
    const postID = context.params.postID;
    const post = change.data() as Post;
    const topicFollowersCollectionRef = db.collection(
      `topics/${topicID}/followedByUsers`
    );

    const updateFollowersOfTopic = async () => {
      return topicFollowersCollectionRef
        .get()
        .then((qs) => {
          const topicFollowers = [] as UserRef[];
          qs.forEach((doc) => {
            topicFollowers.push(doc.data() as UserRef);
          });
          const topicFollowersPromisesArray = topicFollowers.map(
            async (topicFollower) => {
              const userID = topicFollower.id;
              const userPostsDocRef = db.doc(
                `users/${userID}/feeds/followingFeed/posts/${postID}`
              );
              return userPostsDocRef
                .set(post)
                .catch((err) =>
                  console.log(
                    err,
                    'failed to add posts from topic to user following feed'
                  )
                );
            }
          );
          return Promise.all(topicFollowersPromisesArray);
        })
        .catch((err) => console.log(err, 'could not fetch followers of topic'));
    };
    return updateFollowersOfTopic();
  });

interface PublicationSuggestion {
  microsoftAcademicIDMatch: string;
  publicationInfo: Publication;
}
// Rank relates to how often the user posts in this topic
export interface UserRef {
  id: string;
  name: string;
  avatar?: string;
  rank?: number;
}

export function toUserRef(userID: string, user: any) {
  const userRef: UserRef = {
    id: userID,
    name: user.name,
    avatar: user.avatar ? user.avatar : null,
  };
  if (user.rank) userRef.rank = user.rank;
  return userRef;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  avatarCloudID?: string;
  coverPhoto?: string;
  coverPhotoCloudID?: string;
  checkedCreateOnboardingTip?: boolean;
  microsoftID?: string;
}
