import * as functions from 'firebase-functions';
import {firestore} from 'firebase-admin';
import {admin, environment} from './config';
import {
  interpretQuery,
  executeExpression,
  MAKPublication,
  Publication,
  makPublicationToPublication,
  interpretationResult,
} from './microsoft';
import {Post} from './posts';
import {Topic} from './topics';
import {generateThumbnail} from './helpers/images';
import {
  publishAddPublicationRequests,
  allPublicationFields,
} from './publications';

const db = admin.firestore();

const COVER_PHOTO_FILENAME = 'coverPhoto_fullSize';
// Generates thumbnails for cover photos.
export const generateThumbnailCoverPhotoOnFullSizeUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    if (!object.name) return;
    if (!object.name.endsWith(COVER_PHOTO_FILENAME)) return;

    const fullSizeCoverPhotoPath = object.name;
    await generateThumbnail(fullSizeCoverPhotoPath, 'coverPhoto', [
      '-thumbnail',
      '1070x200^',
      '-gravity',
      'center',
      '-extent',
      '1070x200',
    ]);
  });

const AVATAR_FILENAME = 'avatar_fullSize';
// Generates thumbnails for user and group avatars.
export const generateThumbnailAvatarOnFullSizeUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    if (!object.name) return;
    if (!object.name.endsWith(AVATAR_FILENAME)) return;

    const fullSizeAvatarPath = object.name;
    await generateThumbnail(fullSizeAvatarPath, 'avatar', [
      '-thumbnail',
      '200x200^',
      '-gravity',
      'center',
      '-extent',
      '200x200',
    ]);
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
    avatar: userData.avatar,
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

    const batch = db.batch();
    const userToBeLinkedDBRef = db.doc(`users/${userID}`);
    const user = await userToBeLinkedDBRef
      .get()
      .then((qs) => {
        if (!qs.exists) return;
        const userToBeLinked = qs.data() as UserDB;
        if (userToBeLinked.microsoftAcademicAuthorID !== undefined)
          return userToBeLinked;
        batch.update(userToBeLinkedDBRef, {
          microsoftAcademicAuthorID: microsoftAcademicAuthorID,
        });
        return userToBeLinked;
      })
      .catch((err) => console.log(err, 'could not fetch user to be linked'));
    if (!user)
      throw new functions.https.HttpsError(
        'not-found',
        `No user found with ID ${userID}`
      );
    const msPublicationsForUserQS = await db
      .collection(`MSUsers/${microsoftAcademicAuthorID}/publications`)
      .get();
    const publicationWritePromises: Promise<null>[] = [];
    msPublicationsForUserQS.forEach((msPublicationDS) =>
      publicationWritePromises.push(
        (async () => {
          // Find the publication
          const publicationsQS = await db
            .collection('publications')
            .where('microsoftID', '==', msPublicationDS.id)
            .limit(1)
            .get();
          if (publicationsQS.empty) {
            console.log(
              'No publication found with Microsoft Publication ID ',
              msPublicationDS.id,
              ' this should not happen and likely indicates a logic issue.'
            );
          }
          const publicationDS = publicationsQS.docs[0];
          const publication = publicationDS.data();
          batch.set(
            db.doc(`users/${userID}/publications/${publicationDS.id}`),
            publication
          );
          const authorItem = publication.authors.filter(
            (author: any) => author.microsoftID === microsoftAcademicAuthorID
          )[0];
          if (!authorItem) {
            return null;
          }
          batch.update(db.doc(`publications/${publicationDS.id}`), {
            authors: firestore.FieldValue.arrayRemove(authorItem),
          });
          batch.update(db.doc(`publications/${publicationDS.id}`), {
            authors: firestore.FieldValue.arrayUnion(toUserRef(userID, user)),
          });
          return null;
        })()
      )
    );
    await Promise.all(publicationWritePromises).catch((err) =>
      console.error(err)
    );

    await batch.commit().catch((err) => console.error(err));
  }
);

// If we are running the functions locally, we don't want to brick the
// emulators with too many add publication requests, so we use a smaller number
// of interpretations and smaller page size for each of those interpretations.
const SUGGESTED_PUBLICATIONS_INTERPRETATIONS_COUNT = environment === 'local' ? 1 : 10;
const SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE = environment === 'local' ? 10 : 100;

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
  };
  if (user.avatar) userRef.avatar = user.avatar;
  if (user.rank) userRef.rank = user.rank;
  return userRef;
}

interface UserDB {
  microsoftAcademicAuthorID?: string;
}
