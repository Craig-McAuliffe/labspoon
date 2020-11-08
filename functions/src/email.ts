import * as functions from 'firebase-functions';
import {PubSub} from '@google-cloud/pubsub';
import {admin, url} from './config';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';
import {UserRecord} from 'firebase-functions/lib/providers/auth';
import {TaggedTopic} from './topics';

const apiKey = '222484df509ccd85ea7eff14361958f7-ea44b6dc-f3390b70';
const domain = 'www.labspoon.com';
const host = 'api.eu.mailgun.net';
const mailgun = require('mailgun-js')({
  apiKey: apiKey,
  domain: domain,
  host: host,
});

const db = admin.firestore();
const auth = admin.auth();
const pubSubClient = new PubSub();

const hourInMS = 1000 * 60 * 60;
const dayInMS = hourInMS * 24;

// Triggers an update email.
export const triggerEmail = functions.https.onCall(async () => {
  const messageBuffer = Buffer.from(' ');
  return pubSubClient
    .topic('update-email')
    .publish(messageBuffer)
    .catch(() => console.error('Unable to publish to update-email topic'));
});

export const sendUpdateEmail = functions.pubsub
  .topic('update-email')
  .onPublish(async () => {
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) return console.log('No users found');

    // remember to make this idempotent
    const promises: Promise<undefined>[] = [];
    usersSnapshot.forEach((ds) => promises.push(mailUser(ds)));
    return Promise.all(promises);
  });

async function mailUser(ds: DocumentSnapshot): Promise<undefined> {
  const userID = ds.id;
  const user = ds.data();
  let previousUpdateEmailTimestamp = user!.previousUpdateEmailTimestamp;
  const currentTime = new Date();

  // If we have sent an email in the past hour don't send another one so
  // this function is idempotent over a timeframe.
  if (
    previousUpdateEmailTimestamp &&
    currentTime.getTime() - previousUpdateEmailTimestamp.toMillis() <=
    hourInMS
  )
    return;

  if (!previousUpdateEmailTimestamp) {
    previousUpdateEmailTimestamp = new Date(currentTime.getTime() - dayInMS * 3);
  }

  const newUserPostsSnapshot = await db.collection(`users/${userID}/feeds/followingFeed/posts`).orderBy('timestamp').where('timestamp', '>', previousUpdateEmailTimestamp).limit(10).get();
  // If there are no posts don't send an email.
  if (newUserPostsSnapshot.empty) return;
  const templateData = getTemplateDataFromPostsSnapshot(newUserPostsSnapshot);

  const authUserResult = await auth.getUser(userID)
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
      from: 'Labspoon <updates@labspoon.com>',
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
    post!.topics.forEach((topic: TaggedTopic) => activeTopicsMap.set(topic.id, topic));
  });
  let activeUsers = Array.from(activeUsersMap.values()).slice(0, 10);
  let activeTopics = Array.from(activeTopicsMap.values()).slice(0, 10);

  activeUsers.forEach((user, idx) => activeUsers[idx].url = getUserURLFromID(user.id));
  activeTopics.forEach((topic, idx) => activeTopics[idx].url = getTopicURLFromID(topic.id));

  const activeUsersHalfwayIndex = Math.ceil(activeUsers.length / 2);
  const activeTopicsHalfwayIndex = Math.ceil(activeTopics.length / 2);
  return {
    users_left: activeUsers.slice(0, activeUsersHalfwayIndex),
    users_right: activeUsers.slice( activeUsersHalfwayIndex),
    topics_left: activeTopics.slice(0, activeTopicsHalfwayIndex),
    topics_right: activeTopics.slice(activeTopicsHalfwayIndex)
  };
}

function getUserURLFromID(id: string) {
  return `${url}user/${id}`;
}

function getTopicURLFromID(id: string) {
  return `${url}topic/${id}`;
}
