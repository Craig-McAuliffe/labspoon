import * as functions from 'firebase-functions';
import {admin, config, url} from './config';
import {PubSub} from '@google-cloud/pubsub';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';
import {UserRecord} from 'firebase-functions/lib/providers/auth';
import {TaggedTopic} from './topics';
import {toUserRef} from './users';
import {GroupRef, toGroupRef} from './groups';
import {Invitation} from './invitations';

export let mailgun: any;
if (config.mailgun) {
  mailgun = require('mailgun-js')({
    apiKey: config.mailgun.apikey,
    domain: config.mailgun.domain,
    host: config.mailgun.host,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const pubSubClient = new PubSub();

const hourInMS = 1000 * 60 * 60;
const dayInMS = hourInMS * 24;

// Triggers an update email.
export const triggerEmail = functions.https.onCall(async () => {
  const messageString = JSON.stringify({day: 'sunday'});
  const messageBuffer = Buffer.from(messageString);
  return pubSubClient
    .topic('update-email')
    .publish(messageBuffer)
    .catch(() => console.error('Unable to publish to update-email topic'));
});

export const sendUpdateEmail = functions.pubsub
  .topic('update-email')
  .onPublish(async (message) => {
    const day = message.json.day;
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('No users found');
      return;
    }

    // remember to make this idempotent
    const promises: Promise<undefined>[] = [];
    usersSnapshot.forEach((ds) =>
      promises.push(sendUserNotificationEmail(ds, day))
    );
    return Promise.all(promises);
  });

const DEFAULT_UPDATE_EMAIL_SETTINGS = {
  wednesday: false,
  sunday: true,
};

async function sendUserNotificationEmail(
  ds: DocumentSnapshot,
  day: string
): Promise<undefined> {
  if (!mailgun) return;
  const userID = ds.id;
  const user = ds.data();

  if (!user) {
    console.error('User does not exist in user snapshot:', ds);
    return;
  }

  // If the user doesn't have any update email settings yet, set them to the
  // default of getting an email once a week on a sunday
  if (!user.updateEmailSettings) {
    await db
      .doc(`users/${userID}`)
      .update({
        updateEmailSettings: DEFAULT_UPDATE_EMAIL_SETTINGS,
      })
      .catch((err) => alert(err));
    user.updateEmailSettings = DEFAULT_UPDATE_EMAIL_SETTINGS;
  }

  if (user.updateEmailSettings && !user.updateEmailSettings[day]) return;

  let previousUpdateEmailTimestamp = user.previousUpdateEmailTimestamp;
  const currentTime = new Date();

  // If we have sent an email in the past hour don't send another one so
  // this function is idempotent over a timeframe.
  if (
    previousUpdateEmailTimestamp &&
    currentTime.getTime() - previousUpdateEmailTimestamp.toMillis() <= hourInMS
  )
    return;

  if (!previousUpdateEmailTimestamp) {
    previousUpdateEmailTimestamp = new Date(
      currentTime.getTime() - dayInMS * 3
    );
  }

  const newUserPostsSnapshot = await db
    .collection(`users/${userID}/feeds/followingFeed/posts`)
    .orderBy('timestamp')
    .where('timestamp', '>', previousUpdateEmailTimestamp)
    .limit(10)
    .get();
  // If there are no posts don't send an email.
  if (newUserPostsSnapshot.empty) return;
  const templateData = getTemplateDataFromPostsSnapshot(newUserPostsSnapshot);

  const authUserResult = await auth
    .getUser(userID)
    .catch((err: any) =>
      console.error(
        `Unable to retrieve user information for user with ID ${ds.id}:`,
        err
      )
    );
  if (!authUserResult) {
    console.error(`No auth user found with ID ${userID}`);
  }
  const authUser = authUserResult as UserRecord;
  const email = authUser.email;

  if (!email) return;
  mailgun.messages().send(
    {
      from: 'Labspoon <update@mail.labspoon.com>',
      to: email,
      subject: 'Labspoon Updates',
      template: 'update_email',
      'h:X-Mailgun-Variables': JSON.stringify(templateData),
    },
    (err: Error, body: any) => {
      if (err) console.error('Error raised whilst sending email:', err);
      console.log(body);
    }
  );
  db.doc(`users/${userID}`)
    .update({previousUpdateEmailTimestamp: currentTime})
    .catch((err) =>
      console.error(
        `Unable to update previousUpdateEmailTimestamp on user ${userID}:`,
        err
      )
    );
  return;
}

function getTemplateDataFromPostsSnapshot(postsQS: any) {
  const activeUsersMap = new Map();
  const activeTopicsMap = new Map();
  postsQS.forEach((ds: DocumentSnapshot) => {
    const post = ds.data();
    activeUsersMap.set(post!.author.id, post!.author);
    post!.topics.forEach((topic: TaggedTopic) =>
      activeTopicsMap.set(topic.id, topic)
    );
  });
  const activeUsers = Array.from(activeUsersMap.values()).slice(0, 10);
  const activeTopics = Array.from(activeTopicsMap.values()).slice(0, 10);

  activeUsers.forEach(
    (user, idx) => (activeUsers[idx].url = getUserURLFromID(user.id))
  );
  activeTopics.forEach(
    (topic, idx) => (activeTopics[idx].url = getTopicURLFromID(topic.id))
  );

  const activeUsersHalfwayIndex = Math.ceil(activeUsers.length / 2);
  const activeTopicsHalfwayIndex = Math.ceil(activeTopics.length / 2);
  return {
    users_left: activeUsers.slice(0, activeUsersHalfwayIndex),
    users_right: activeUsers.slice(activeUsersHalfwayIndex),
    topics_left: activeTopics.slice(0, activeTopicsHalfwayIndex),
    topics_right: activeTopics.slice(activeTopicsHalfwayIndex),
  };
}

function getUserURLFromID(id: string) {
  return `${url}user/${id}`;
}

function getTopicURLFromID(id: string) {
  return `${url}topic/${id}`;
}

export async function sendGroupInvitationEmail(
  invitationID: string,
  invitation: Invitation
) {
  if (!mailgun) {
    console.error(
      'mailgun has not been defined. For local, add mailgun to .runtimeconfig, found within the functions directory, by following instructions in README.md. For the cloud, add mailgun to config file.'
    );
    throw new Error(
      'Unable to send email invite. Sorry about that. Please try again later.'
    );
    return;
  }
  if (!url) {
    console.error(
      'the env url has not been defined. For local, add a url to the env of .runtimeconfig found within the functions directory, by following instructions in README.md. For the cloud, add a value for config env.'
    );
    throw new Error(
      'Unable to send email invite. Sorry about that. Please try again later.'
    );
    return;
  }
  const emailAddress = invitation.email;

  const groupID = invitation.resourceID;
  const groupRef = db.doc(`groups/${groupID}`);

  const invitingUserID = invitation.invitingUserID;
  const invitingUserDS = await db.doc(`users/${invitingUserID}`).get();
  const invitingUser = invitingUserDS.data();
  const invitingUserRef = toUserRef(invitingUserID, invitingUser);

  let authUser;
  try {
    authUser = await admin.auth().getUserByEmail(emailAddress);
  } catch (err) {
    // We handle not finding the user by inviting them, but for any other error we rethrow.
    if (!(err.code === 'auth/user-not-found')) throw err;
  }
  if (authUser) {
    const authUserID = authUser.uid;
    const authUserDS = await db.doc(`users/${authUserID}`).get();
    if (!authUserDS.exists)
      throw new Error(`No user found in DB for auth User ID ${authUserID}`);
    const batch = db.batch();
    batch.set(
      groupRef.collection('members').doc(authUserID),
      toUserRef(authUserID, authUserDS.data())
    );
    batch.delete(groupRef.collection('invitations').doc(invitationID));
    await batch.commit();
    return;
  }

  const groupDS = await groupRef.get();
  if (!groupDS.exists) throw new Error(`No group found with ID ${groupID}`);
  const group = groupDS.data() as GroupRef;

  const templateData = {
    invitingUser: invitingUserRef,
    group: toGroupRef(groupID, group),
    url: encodeURI(`${url}login?referrer=groupInvite`),
  };

  const subject = `${invitingUser!.name} is inviting you to join ${
    group.name
  } on Labspoon!`;

  mailgun.messages().send(
    {
      from: 'Labspoon <invite@mail.labspoon.com>',
      to: emailAddress,
      subject: subject,
      template: 'group-invitation-email',
      'h:X-Mailgun-Variables': JSON.stringify(templateData),
    },
    (err: Error) => {
      if (err) console.error('Error raised whilst sending email:', err);
    }
  );
  return;
}
